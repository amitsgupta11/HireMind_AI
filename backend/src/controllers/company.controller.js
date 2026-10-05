const companyService = require("../services/company.service");
const asyncHandler = require("../utils/asyncHandler");

const getMyCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getMyCompany(req.user.id);
  res.status(200).json({ success: true, data: { company } });
});

const upsertMyCompany = asyncHandler(async (req, res) => {
  const company = await companyService.upsertMyCompany(req.user.id, req.body);
  res.status(200).json({ success: true, data: { company } });
});

module.exports = { getMyCompany, upsertMyCompany };
