const express = require("express");
const {
  createAssessment,
  updateAssessment,
  getAssessmentForRecruiter,
  getAssessmentByJob,
  startAttempt,
  submitAttempt,
} = require("../controllers/assessment.controller");
const { createAssessmentSchema, updateAssessmentSchema, submitAttemptSchema } = require("../validators/assessment.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authenticate, authorize("RECRUITER"), validate(createAssessmentSchema), createAssessment);
router.put("/:id", authenticate, authorize("RECRUITER"), validate(updateAssessmentSchema), updateAssessment);
router.get("/job/:jobId", authenticate, authorize("RECRUITER"), getAssessmentByJob);
router.get("/:id", authenticate, authorize("RECRUITER"), getAssessmentForRecruiter);
router.post("/:id/start", authenticate, authorize("CANDIDATE"), startAttempt);
router.post("/:id/submit", authenticate, authorize("CANDIDATE"), validate(submitAttemptSchema), submitAttempt);

module.exports = router;
