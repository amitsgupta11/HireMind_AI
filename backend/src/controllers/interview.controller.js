const interviewService = require("../services/interview.service");
const asyncHandler = require("../utils/asyncHandler");

const startInterview = asyncHandler(async (req, res) => {
  const interview = await interviewService.startInterview(req.user.id, req.body.applicationId);
  res.status(200).json({ success: true, data: { interview } });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const result = await interviewService.submitAnswer(
    req.user.id,
    req.params.id,
    req.body.questionId,
    req.body.answerText
  );
  res.status(200).json({ success: true, data: result });
});

const completeInterview = asyncHandler(async (req, res) => {
  const report = await interviewService.completeInterview(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { report } });
});

const getReport = asyncHandler(async (req, res) => {
  const report = await interviewService.getReport(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { report } });
});

module.exports = { startInterview, submitAnswer, completeInterview, getReport };
