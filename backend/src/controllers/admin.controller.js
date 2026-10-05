const adminService = require("../services/admin.service");
const asyncHandler = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
  const users = await adminService.listUsers(req.query);
  res.status(200).json({ success: true, data: { users } });
});

const listCompanies = asyncHandler(async (req, res) => {
  const companies = await adminService.listCompanies();
  res.status(200).json({ success: true, data: { companies } });
});

const listJobs = asyncHandler(async (req, res) => {
  const jobs = await adminService.listJobs();
  res.status(200).json({ success: true, data: { jobs } });
});

const setUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.setUserStatus(req.user.id, req.params.id, req.body.status);
  res.status(200).json({ success: true, data: { user } });
});

const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  res.status(200).json({ success: true, data: { analytics } });
});

module.exports = { listUsers, listCompanies, listJobs, setUserStatus, getPlatformAnalytics };
