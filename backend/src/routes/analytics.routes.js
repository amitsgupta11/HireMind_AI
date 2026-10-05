const express = require("express");
const { getRecruiterAnalytics } = require("../controllers/analytics.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/recruiter", authenticate, authorize("RECRUITER"), getRecruiterAnalytics);

module.exports = router;
