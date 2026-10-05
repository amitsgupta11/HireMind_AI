const assessmentService = require("../services/assessment.service");
const asyncHandler = require("../utils/asyncHandler");

const createAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.createAssessment(req.user.id, req.body);
  res.status(201).json({ success: true, data: { assessment } });
});

const updateAssessment = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.updateAssessment(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: { assessment } });
});

const getAssessmentForRecruiter = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getAssessmentForRecruiter(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { assessment } });
});

const getAssessmentByJob = asyncHandler(async (req, res) => {
  const assessment = await assessmentService.getAssessmentByJob(req.user.id, req.params.jobId);
  res.status(200).json({ success: true, data: { assessment } });
});

const startAttempt = asyncHandler(async (req, res) => {
  const result = await assessmentService.startAttempt(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await assessmentService.submitAttempt(req.user.id, req.params.id, req.body.answers);
  res.status(200).json({ success: true, data: { attempt } });
});

module.exports = {
  createAssessment,
  updateAssessment,
  getAssessmentForRecruiter,
  getAssessmentByJob,
  startAttempt,
  submitAttempt,
};
