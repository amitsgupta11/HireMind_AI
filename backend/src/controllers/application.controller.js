const applicationService = require("../services/application.service");
const asyncHandler = require("../utils/asyncHandler");

const applyToJob = asyncHandler(async (req, res) => {
  const application = await applicationService.applyToJob(req.user.id, req.params.id);
  res.status(201).json({ success: true, data: { application } });
});

const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.listMyApplications(req.user.id);
  res.status(200).json({ success: true, data: { applications } });
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { application } });
});

const getCandidateResume = asyncHandler(async (req, res) => {
  const resume = await applicationService.getCandidateResumeForApplication(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { resume } });
});

const listApplicantsForJob = asyncHandler(async (req, res) => {
  const applications = await applicationService.listApplicantsForJob(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { applications } });
});

const updateStatus = asyncHandler(async (req, res) => {
  const application = await applicationService.updateStatus(req.user.id, req.params.id, req.body.status);
  res.status(200).json({ success: true, data: { application } });
});

const shortlist = asyncHandler(async (req, res) => {
  const application = await applicationService.updateStatus(req.user.id, req.params.id, "SHORTLISTED");
  res.status(200).json({ success: true, data: { application } });
});

const reject = asyncHandler(async (req, res) => {
  const application = await applicationService.updateStatus(req.user.id, req.params.id, "REJECTED");
  res.status(200).json({ success: true, data: { application } });
});

module.exports = {
  applyToJob,
  listMyApplications,
  getApplicationById,
  getCandidateResume,
  listApplicantsForJob,
  updateStatus,
  shortlist,
  reject,
};
