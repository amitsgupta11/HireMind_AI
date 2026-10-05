const express = require("express");
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getReport,
} = require("../controllers/interview.controller");
const { startInterviewSchema, answerSchema } = require("../validators/interview.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/start", authenticate, authorize("CANDIDATE"), aiLimiter, validate(startInterviewSchema), startInterview);
router.post("/:id/answer", authenticate, authorize("CANDIDATE"), aiLimiter, validate(answerSchema), submitAnswer);
router.post("/:id/complete", authenticate, authorize("CANDIDATE"), completeInterview);
router.get("/:id/report", authenticate, getReport);

module.exports = router;
