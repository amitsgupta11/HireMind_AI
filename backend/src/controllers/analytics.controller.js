const analyticsService = require("../services/analytics.service");
const asyncHandler = require("../utils/asyncHandler");

const getRecruiterAnalytics = asyncHandler(async (req, res) => {
  const analytics = await analyticsService.getRecruiterAnalytics(req.user.id);
  res.status(200).json({ success: true, data: { analytics } });
});

module.exports = { getRecruiterAnalytics };
