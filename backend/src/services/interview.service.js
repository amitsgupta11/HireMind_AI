const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const { generateNextQuestion } = require("../ai/interviewGenerator");
const { evaluateAnswer } = require("../ai/interviewEvaluator");
const { aggregateInterviewScore, buildSummary } = require("./interviewScoring.service");
const applicationService = require("./application.service");
const notificationService = require("./notification.service");

const TOTAL_QUESTIONS = 5;

async function getOwnedApplication(applicationId, userId) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  });
  if (!application) throw ApiError.notFound("Application not found");
  if (application.userId !== userId) throw ApiError.forbidden("You do not have access to this application");
  return application;
}

async function getCandidateSkills(userId) {
  const resume = await prisma.resume.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  return resume && resume.status === "COMPLETED" ? resume.skills || [] : [];
}

async function startInterview(userId, applicationId) {
  const application = await getOwnedApplication(applicationId, userId);

  const existing = await prisma.interview.findUnique({
    where: { applicationId },
    include: { questions: { orderBy: { order: "asc" }, include: { answer: true } } },
  });
  if (existing) return existing;

  const candidateSkills = await getCandidateSkills(userId);

  const questionText = await generateNextQuestion({
    jobTitle: application.job.title,
    jobDescription: application.job.description,
    candidateSkills,
    previousQA: [],
  });

  const interview = await prisma.interview.create({
    data: {
      applicationId,
      status: "IN_PROGRESS",
      questions: { create: [{ order: 1, questionText }] },
    },
    include: { questions: { orderBy: { order: "asc" }, include: { answer: true } } },
  });

  await applicationService.advanceStatusIfActive(applicationId, "INTERVIEW_ASSIGNED");

  return interview;
}

async function submitAnswer(userId, interviewId, questionId, answerText) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: { include: { job: true } },
      questions: { orderBy: { order: "asc" }, include: { answer: true } },
    },
  });
  if (!interview) throw ApiError.notFound("Interview not found");
  if (interview.application.userId !== userId) {
    throw ApiError.forbidden("You do not have access to this interview");
  }
  if (interview.status === "COMPLETED") {
    throw ApiError.conflict("This interview has already been completed", "INTERVIEW_COMPLETED");
  }

  const question = interview.questions.find((q) => q.id === questionId);
  if (!question) throw ApiError.notFound("Question not found");
  if (question.answer) throw ApiError.conflict("This question has already been answered", "ALREADY_ANSWERED");

  const evaluation = await evaluateAnswer({ question: question.questionText, answerText });

  await prisma.interviewAnswer.create({
    data: {
      interviewQuestionId: questionId,
      answerText,
      technicalAccuracy: evaluation.technicalAccuracy,
      communication: evaluation.communication,
      problemSolving: evaluation.problemSolving,
      confidence: evaluation.confidence,
      relevance: evaluation.relevance,
      feedback: evaluation.feedback,
    },
  });

  const answeredCount = interview.questions.filter((q) => q.answer).length + 1;

  if (answeredCount >= TOTAL_QUESTIONS) {
    const report = await completeInterview(userId, interviewId);
    return { evaluation, nextQuestion: null, completed: true, report };
  }

  const previousQA = [
    ...interview.questions
      .filter((q) => q.answer)
      .map((q) => ({ question: q.questionText, answer: q.answer.answerText })),
    { question: question.questionText, answer: answerText },
  ];

  const candidateSkills = await getCandidateSkills(userId);
  const nextQuestionText = await generateNextQuestion({
    jobTitle: interview.application.job.title,
    jobDescription: interview.application.job.description,
    candidateSkills,
    previousQA,
  });

  const nextOrder = Math.max(...interview.questions.map((q) => q.order)) + 1;
  const nextQuestion = await prisma.interviewQuestion.create({
    data: { interviewId, order: nextOrder, questionText: nextQuestionText },
  });

  return { evaluation, nextQuestion, completed: false, report: null };
}

async function completeInterview(userId, interviewId) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: true,
      questions: { include: { answer: true }, orderBy: { order: "asc" } },
    },
  });
  if (!interview) throw ApiError.notFound("Interview not found");
  if (interview.application.userId !== userId) {
    throw ApiError.forbidden("You do not have access to this interview");
  }

  if (interview.status === "COMPLETED") {
    return getReport(userId, interviewId);
  }

  const answers = interview.questions.filter((q) => q.answer).map((q) => q.answer);
  const aggregate = aggregateInterviewScore(answers);

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: "COMPLETED",
      overallScore: aggregate?.overall ?? null,
      scoreBreakdown: aggregate?.breakdown ?? null,
      summary: aggregate ? buildSummary(aggregate.breakdown) : "No questions were answered.",
      completedAt: new Date(),
    },
    include: { questions: { include: { answer: true }, orderBy: { order: "asc" } } },
  });

  await applicationService.advanceStatusIfActive(interview.applicationId, "UNDER_REVIEW");
  await notificationService.createNotification(userId, {
    type: "APPLICATION_STATUS",
    title: "AI Interview completed",
    message: aggregate
      ? `Your interview is complete — overall score ${aggregate.overall}/100.`
      : "Your AI interview has been marked complete.",
  });

  return updated;
}

async function getReport(userId, interviewId) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: { include: { job: { include: { company: true } } } },
      questions: { include: { answer: true }, orderBy: { order: "asc" } },
    },
  });
  if (!interview) throw ApiError.notFound("Interview not found");

  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  const isOwner = interview.application.userId === userId;
  const isRecruiterForJob = recruiter && recruiter.companyId === interview.application.job.companyId;

  if (!isOwner && !isRecruiterForJob) {
    throw ApiError.forbidden("You do not have access to this interview");
  }

  return interview;
}

module.exports = { startInterview, submitAnswer, completeInterview, getReport, TOTAL_QUESTIONS };
