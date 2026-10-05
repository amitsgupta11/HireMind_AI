const jobService = require("../services/job.service");
const asyncHandler = require("../utils/asyncHandler");

const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user.id, req.body);
  res.status(201).json({ success: true, data: { job } });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: { job } });
});

const deleteJob = asyncHandler(async (req, res) => {
  const result = await jobService.deleteJob(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
});

const publishJob = asyncHandler(async (req, res) => {
  const job = await jobService.setPublishState(req.user.id, req.params.id, Boolean(req.body.isPublished));
  res.status(200).json({ success: true, data: { job } });
});

const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json({ success: true, data: { job } });
});

const listMyJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.listMyJobs(req.user.id, req.query);
  res.status(200).json({ success: true, data: { jobs } });
});

const listPublicJobs = asyncHandler(async (req, res) => {
  const jobs = await jobService.listPublicJobs(req.query);
  res.status(200).json({ success: true, data: { jobs } });
});

const listJobsForCandidate = asyncHandler(async (req, res) => {
  const jobs = await jobService.listJobsForCandidate(req.user.id, req.query);
  res.status(200).json({ success: true, data: { jobs } });
});

const getJobMatch = asyncHandler(async (req, res) => {
  const match = await jobService.getJobMatchForCandidate(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { match } });
});

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  getJob,
  listMyJobs,
  listPublicJobs,
  listJobsForCandidate,
  getJobMatch,
};
