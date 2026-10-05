const express = require("express");
const { getMyCompany, upsertMyCompany } = require("../controllers/company.controller");
const { companySchema } = require("../validators/company.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticate, authorize("RECRUITER"), getMyCompany);
router.put("/me", authenticate, authorize("RECRUITER"), validate(companySchema), upsertMyCompany);

module.exports = router;
