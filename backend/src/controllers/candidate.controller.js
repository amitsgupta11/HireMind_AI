const candidateService = require("../services/candidate.service");
const asyncHandler = require("../utils/asyncHandler");

const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await candidateService.getMyProfile(req.user.id);
  res.status(200).json({ success: true, data: { profile } });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await candidateService.updateMyProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: { profile } });
});

module.exports = { getMyProfile, updateMyProfile };
