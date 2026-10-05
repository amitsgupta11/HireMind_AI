const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const jobMatching = require("./jobMatching.service");

// The core feature. Weights match the documented spec exactly:
//   Candidate Intelligence =
//     0.30 * Resume Score + 0.25 * Match Score + 0.25 * Assessment Score + 0.20 * Interview Score
//
// If a component doesn't exist yet (e.g. the candidate hasn't taken the
// assessment), it's left out and the remaining weights are proportionally
// rescaled — more honest than silently treating a not-yet-done step as a
// zero, while still using the exact same weight RATIOS the spec defines.
const WEIGHTS = { resumeScore: 0.3, matchScore: 0.25, assessmentScore: 0.25, interviewScore: 0.2 };

async function assertAccess(application, userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  const isOwner = application.userId === userId;
  const isRecruiterForJob = recruiter && recruiter.companyId === application.job.companyId;
  if (!isOwner && !isRecruiterForJob) {
    throw ApiError.forbidden("You do not have access to this application");
  }
}

// Pure, DB-free — extracted so it can be unit tested directly. Takes
// whichever of the 4 scores actually exist (null/undefined for the rest)
// and returns the weighted-and-rescaled overall score.
function computeOverallScore(values) {
  const available = Object.entries(values).filter(([, v]) => v != null);
  if (available.length === 0) return null;
  const totalWeight = available.reduce((sum, [key]) => sum + WEIGHTS[key], 0);
  return Math.round(available.reduce((sum, [key, v]) => sum + v * WEIGHTS[key], 0) / totalWeight);
}

async function getOrComputeIntelligence(applicationId, userId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { skills: true, company: true } },
      assessmentAttempt: true,
      interview: true,
    },
  });
  if (!application) throw ApiError.notFound("Application not found");
  await assertAccess(application, userId);

  const resume = await prisma.resume.findFirst({
    where: { userId: application.userId },
    orderBy: { createdAt: "desc" },
  });

  let matchScore = null;
  if (resume && resume.status === "COMPLETED") {
    const years = jobMatching.totalExperienceYears(resume);
    const match = jobMatching.calculateJobMatch(resume.skills || [], years, application.job);
    matchScore = match.overall;
  }

  const resumeScore = resume && resume.status === "COMPLETED" ? resume.resumeScore : null;
  const assessmentScore =
    application.assessmentAttempt && application.assessmentAttempt.status === "SUBMITTED"
      ? application.assessmentAttempt.score
      : null;
  const interviewScore =
    application.interview && application.interview.status === "COMPLETED"
      ? application.interview.overallScore
      : null;

  const values = { resumeScore, matchScore, assessmentScore, interviewScore };
  const overallScore = computeOverallScore(values);

  return prisma.candidateIntelligence.upsert({
    where: { applicationId },
    update: { ...values, overallScore, computedAt: new Date() },
    create: { applicationId, ...values, overallScore },
  });
}

module.exports = { getOrComputeIntelligence, computeOverallScore, WEIGHTS };
