const candidateIntelligenceService = require("../services/candidateIntelligence.service");
const asyncHandler = require("../utils/asyncHandler");

const getForApplication = asyncHandler(async (req, res) => {
  const intelligence = await candidateIntelligenceService.getOrComputeIntelligence(
    req.params.applicationId,
    req.user.id
  );
  res.status(200).json({ success: true, data: { intelligence } });
});

module.exports = { getForApplication };
