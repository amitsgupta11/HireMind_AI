const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { scoreAttempt } = require("./assessmentScoring.service");
const applicationService = require("./application.service");
const notificationService = require("./notification.service");

async function assertJobOwnership(jobId, userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile first", "NO_COMPANY");
  }
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw ApiError.notFound("Job not found");
  if (job.companyId !== recruiter.companyId) {
    throw ApiError.forbidden("You do not have access to this job");
  }
  return job;
}

async function createAssessment(userId, data) {
  await assertJobOwnership(data.jobId, userId);

  const existing = await prisma.assessment.findUnique({ where: { jobId: data.jobId } });
  if (existing) {
    throw ApiError.conflict("This job already has an assessment — edit it instead", "ASSESSMENT_EXISTS");
  }

  return prisma.assessment.create({
    data: {
      jobId: data.jobId,
      title: data.title,
      durationMinutes: data.durationMinutes,
      questions: {
        create: data.questions.map((q, i) => ({
          type: q.type,
          text: q.text,
          options: q.type === "MCQ" ? q.options : undefined,
          correctIndex: q.type === "MCQ" ? q.correctIndex : undefined,
          order: q.order ?? i,
        })),
      },
    },
    include: { questions: true },
  });
}

async function updateAssessment(userId, assessmentId, data) {
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) throw ApiError.notFound("Assessment not found");
  await assertJobOwnership(assessment.jobId, userId);

  return prisma.$transaction(async (tx) => {
    if (data.questions) {
      await tx.question.deleteMany({ where: { assessmentId } });
      await tx.question.createMany({
        data: data.questions.map((q, i) => ({
          assessmentId,
          type: q.type,
          text: q.text,
          options: q.type === "MCQ" ? q.options : undefined,
          correctIndex: q.type === "MCQ" ? q.correctIndex : undefined,
          order: q.order ?? i,
        })),
      });
    }

    return tx.assessment.update({
      where: { id: assessmentId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
      },
      include: { questions: { orderBy: { order: "asc" } } },
    });
  });
}

async function getAssessmentForRecruiter(userId, assessmentId) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { orderBy: { order: "asc" } }, job: true },
  });
  if (!assessment) throw ApiError.notFound("Assessment not found");
  await assertJobOwnership(assessment.jobId, userId);
  return assessment;
}

async function getAssessmentByJob(userId, jobId) {
  const assessment = await prisma.assessment.findUnique({
    where: { jobId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!assessment) throw ApiError.notFound("This job has no assessment attached");
  await assertJobOwnership(jobId, userId);
  return assessment;
}

// Candidate-facing question view — correct answers are stripped so
// there is never a way to see them before submitting.
function stripAnswers(question) {
  const { correctIndex, ...safe } = question;
  return safe;
}

async function startAttempt(userId, assessmentId) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { orderBy: { order: "asc" } }, job: true },
  });
  if (!assessment) throw ApiError.notFound("Assessment not found");

  const application = await prisma.application.findUnique({
    where: { jobId_userId: { jobId: assessment.jobId, userId } },
  });
  if (!application) {
    throw ApiError.forbidden("You must apply to this job before taking its assessment");
  }

  const existing = await prisma.assessmentAttempt.findUnique({
    where: { applicationId: application.id },
  });
  if (existing) {
    return { attempt: existing, questions: assessment.questions.map(stripAnswers), assessment };
  }

  const attempt = await prisma.assessmentAttempt.create({
    data: { assessmentId, applicationId: application.id, status: "IN_PROGRESS" },
  });

  return { attempt, questions: assessment.questions.map(stripAnswers), assessment };
}

async function submitAttempt(userId, assessmentId, answers) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true },
  });
  if (!assessment) throw ApiError.notFound("Assessment not found");

  const application = await prisma.application.findUnique({
    where: { jobId_userId: { jobId: assessment.jobId, userId } },
  });
  if (!application) throw ApiError.forbidden("You have not applied to this job");

  const attempt = await prisma.assessmentAttempt.findUnique({ where: { applicationId: application.id } });
  if (!attempt) throw ApiError.badRequest("Start the assessment before submitting", "ATTEMPT_NOT_STARTED");
  if (attempt.status === "SUBMITTED") {
    throw ApiError.conflict("This assessment has already been submitted", "ALREADY_SUBMITTED");
  }

  const result = scoreAttempt(assessment.questions, answers);

  await prisma.$transaction(async (tx) => {
    await tx.answer.deleteMany({ where: { attemptId: attempt.id } });
    await tx.answer.createMany({
      data: result.perQuestionResults.map((r) => ({
        attemptId: attempt.id,
        questionId: r.questionId,
        selectedIndex: r.selectedIndex ?? null,
        textAnswer: r.textAnswer ?? null,
        isCorrect: r.isCorrect,
        pointsAwarded: r.pointsAwarded,
      })),
    });

    await tx.assessmentAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        score: result.normalizedScore,
        maxScore: result.maxScore,
        submittedAt: new Date(),
      },
    });
  });

  await applicationService.advanceStatusIfActive(application.id, "UNDER_REVIEW");
  await notificationService.createNotification(userId, {
    type: "APPLICATION_STATUS",
    title: "Assessment submitted",
    message:
      result.normalizedScore != null
        ? `You scored ${result.normalizedScore}/100 on the assessment.`
        : "Your assessment answers have been submitted for review.",
  });

  return prisma.assessmentAttempt.findUnique({
    where: { id: attempt.id },
    include: { answers: true },
  });
}

module.exports = {
  createAssessment,
  updateAssessment,
  getAssessmentForRecruiter,
  getAssessmentByJob,
  startAttempt,
  submitAttempt,
};
