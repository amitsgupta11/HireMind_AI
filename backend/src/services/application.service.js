const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const notificationService = require("./notification.service");

const STATUS_NOTIFICATION_COPY = {
  UNDER_REVIEW: { title: "Application under review", message: "A recruiter is reviewing your application." },
  ASSESSMENT_ASSIGNED: { title: "Assessment assigned", message: "You've been assigned an assessment — check your applications." },
  INTERVIEW_ASSIGNED: { title: "AI Interview assigned", message: "You've been assigned an AI interview — check your applications." },
  SHORTLISTED: { title: "You've been shortlisted!", message: "Great news — the recruiter has shortlisted your application." },
  REJECTED: { title: "Application update", message: "Your application status has been updated." },
};

async function applyToJob(userId, jobId) {
  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { assessment: true } });
  if (!job || !job.isPublished) {
    throw ApiError.notFound("This job is not accepting applications", "JOB_NOT_AVAILABLE");
  }

  const resume = await prisma.resume.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  if (!resume) {
    throw ApiError.badRequest("Upload a resume before applying", "RESUME_REQUIRED");
  }

  // If this job has a screening assessment attached, the application
  // starts life already "assigned" that assessment — it's bound to the
  // job itself, not something a recruiter assigns per candidate.
  const initialStatus = job.assessment ? "ASSESSMENT_ASSIGNED" : "APPLIED";

  try {
    const application = await prisma.application.create({
      data: { jobId, userId, status: initialStatus },
      include: { job: { include: { company: true } } },
    });

    if (job.assessment) {
      await notificationService.createNotification(userId, {
        type: "ASSESSMENT_ASSIGNED",
        title: "Assessment assigned",
        message: `${job.title} includes a screening assessment — you can start it from your applications.`,
      });
    }

    return application;
  } catch (err) {
    if (err.code === "P2002") {
      throw ApiError.conflict("You've already applied to this job", "ALREADY_APPLIED");
    }
    throw err;
  }
}

async function listMyApplications(userId) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      job: { include: { company: true, assessment: true } },
      assessmentAttempt: true,
      interview: true,
      candidateIntelligence: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getApplicationById(applicationId, userId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { company: true, skills: true, assessment: true } },
      assessmentAttempt: { include: { answers: true } },
      interview: { include: { questions: { include: { answer: true } } } },
      candidateIntelligence: true,
    },
  });
  if (!application) throw ApiError.notFound("Application not found");

  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  const isOwner = application.userId === userId;
  const isRecruiterForJob = recruiter && recruiter.companyId === application.job.companyId;

  if (!isOwner && !isRecruiterForJob) {
    throw ApiError.forbidden("You do not have access to this application");
  }

  return application;
}

// Confirms the recruiter making this call owns the company behind the
// job this application belongs to — same ownership pattern as job.service.js.
async function assertRecruiterOwnsApplication(applicationId, userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile first", "NO_COMPANY");
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) throw ApiError.notFound("Application not found");

  if (application.job.companyId !== recruiter.companyId) {
    throw ApiError.forbidden("You do not have access to this application");
  }

  return application;
}

async function listApplicantsForJob(userId, jobId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile first", "NO_COMPANY");
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw ApiError.notFound("Job not found");
  if (job.companyId !== recruiter.companyId) {
    throw ApiError.forbidden("You do not have access to this job's applicants");
  }

  const applications = await prisma.application.findMany({
    where: { jobId },
    include: {
      user: { include: { candidateProfile: true, resumes: { orderBy: { createdAt: "desc" }, take: 1 } } },
      assessmentAttempt: true,
      interview: true,
      candidateIntelligence: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return applications;
}

async function updateStatus(userId, applicationId, status) {
  const application = await assertRecruiterOwnsApplication(applicationId, userId);

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "APPLICATION_STATUS_CHANGED",
      targetType: "Application",
      targetId: applicationId,
      metadata: { from: application.status, to: status },
    },
  });

  const copy = STATUS_NOTIFICATION_COPY[status];
  if (copy) {
    await notificationService.createNotification(application.userId, {
      type: status === "SHORTLISTED" ? "SHORTLISTED" : status === "REJECTED" ? "REJECTED" : "APPLICATION_STATUS",
      title: copy.title,
      message: copy.message,
    });
  }

  return updated;
}

// Auto-advances an application's status as the candidate completes steps
// in the pipeline (submitting an assessment, finishing an interview) —
// but never overwrites a terminal decision the recruiter already made.
async function advanceStatusIfActive(applicationId, newStatus) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) return null;
  if (["SHORTLISTED", "REJECTED"].includes(application.status)) return application;

  return prisma.application.update({ where: { id: applicationId }, data: { status: newStatus } });
}

// Lets a recruiter (ownership-checked via the application) see the same
// Resume Intelligence report the candidate sees on their own dashboard —
// reuses the exact same resume row, never a separate "recruiter view" of
// different data.
async function getCandidateResumeForApplication(applicationId, userId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) throw ApiError.notFound("Application not found");

  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  const isOwner = application.userId === userId;
  const isRecruiterForJob = recruiter && recruiter.companyId === application.job.companyId;
  if (!isOwner && !isRecruiterForJob) {
    throw ApiError.forbidden("You do not have access to this application");
  }

  return prisma.resume.findFirst({
    where: { userId: application.userId },
    orderBy: { createdAt: "desc" },
  });
}

module.exports = {
  applyToJob,
  listMyApplications,
  getApplicationById,
  listApplicantsForJob,
  updateStatus,
  advanceStatusIfActive,
  getCandidateResumeForApplication,
};
