const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

// Every recruiter-facing job mutation goes through this — confirms the job
// belongs to the recruiter's own company before allowing any change.
async function assertOwnership(jobId, userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile before managing jobs", "NO_COMPANY");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw ApiError.notFound("Job not found");

  if (job.companyId !== recruiter.companyId) {
    throw ApiError.forbidden("You do not have access to this job");
  }

  return { job, recruiter };
}

function toSkillRows(jobId, requiredSkills = [], preferredSkills = []) {
  const dedupe = (arr) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
  return [
    ...dedupe(requiredSkills).map((name) => ({ jobId, name, level: "REQUIRED" })),
    ...dedupe(preferredSkills).map((name) => ({ jobId, name, level: "PREFERRED" })),
  ];
}

async function createJob(userId, data) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile before posting a job", "NO_COMPANY");
  }

  const { requiredSkills, preferredSkills, isPublished, ...jobFields } = data;

  const job = await prisma.job.create({
    data: {
      ...jobFields,
      companyId: recruiter.companyId,
      isPublished: Boolean(isPublished),
      skills: { create: toSkillRows(undefined, requiredSkills, preferredSkills).map(({ name, level }) => ({ name, level })) },
    },
    include: { skills: true, company: true },
  });

  return job;
}

async function updateJob(userId, jobId, data) {
  await assertOwnership(jobId, userId);

  const { requiredSkills, preferredSkills, ...jobFields } = data;

  return prisma.$transaction(async (tx) => {
    if (requiredSkills !== undefined || preferredSkills !== undefined) {
      // Replace the full skill set atomically — simpler and safer than a
      // diff, since the wizard always sends the complete current list.
      const existing = await tx.jobSkill.findMany({ where: { jobId } });
      const currentRequired = existing.filter((s) => s.level === "REQUIRED").map((s) => s.name);
      const currentPreferred = existing.filter((s) => s.level === "PREFERRED").map((s) => s.name);

      await tx.jobSkill.deleteMany({ where: { jobId } });
      await tx.jobSkill.createMany({
        data: toSkillRows(
          jobId,
          requiredSkills !== undefined ? requiredSkills : currentRequired,
          preferredSkills !== undefined ? preferredSkills : currentPreferred
        ),
      });
    }

    return tx.job.update({
      where: { id: jobId },
      data: jobFields,
      include: { skills: true, company: true },
    });
  });
}

async function deleteJob(userId, jobId) {
  await assertOwnership(jobId, userId);
  await prisma.job.delete({ where: { id: jobId } });
  return { message: "Job deleted" };
}

async function setPublishState(userId, jobId, isPublished) {
  await assertOwnership(jobId, userId);
  return prisma.job.update({
    where: { id: jobId },
    data: { isPublished },
    include: { skills: true, company: true },
  });
}

async function getJobById(jobId) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { skills: true, company: true },
  });
  if (!job) throw ApiError.notFound("Job not found");
  return job;
}

async function listMyJobs(userId, { status, search } = {}) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) return [];

  return prisma.job.findMany({
    where: {
      companyId: recruiter.companyId,
      ...(status === "published" ? { isPublished: true } : {}),
      ...(status === "draft" ? { isPublished: false } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    },
    include: { skills: true, assessment: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function listPublicJobs({ search, location } = {}) {
  return prisma.job.findMany({
    where: {
      isPublished: true,
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
    },
    include: { skills: true, company: true },
    orderBy: { createdAt: "desc" },
  });
}

// Candidate-facing "Find Jobs" — every published job with a real match %
// computed against the candidate's latest completed resume. Requires the
// resume analysis to be done first, same as the single-job match endpoint.
async function listJobsForCandidate(userId, { search, location } = {}) {
  const jobMatching = require("./jobMatching.service");

  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  jobMatching.assertResumeReady(resume);

  const jobs = await prisma.job.findMany({
    where: {
      isPublished: true,
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(location ? { location: { contains: location, mode: "insensitive" } } : {}),
    },
    include: { skills: true, company: true },
    orderBy: { createdAt: "desc" },
  });

  const candidateExperienceYears = jobMatching.totalExperienceYears(resume);

  const jobsWithMatch = jobs.map((job) => {
    const match = jobMatching.calculateJobMatch(resume.skills || [], candidateExperienceYears, job);
    return { ...job, match };
  });

  jobsWithMatch.sort((a, b) => b.match.overall - a.match.overall);
  return jobsWithMatch;
}

async function getJobMatchForCandidate(jobId, userId) {
  const jobMatching = require("./jobMatching.service");

  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  jobMatching.assertResumeReady(resume);

  const job = await getJobById(jobId);
  const candidateExperienceYears = jobMatching.totalExperienceYears(resume);
  return jobMatching.calculateJobMatch(resume.skills || [], candidateExperienceYears, job);
}

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  setPublishState,
  getJobById,
  listMyJobs,
  listPublicJobs,
  listJobsForCandidate,
  getJobMatchForCandidate,
};
