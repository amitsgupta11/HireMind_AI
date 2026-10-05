const express = require("express");
const {
  listMyApplications,
  getApplicationById,
  getCandidateResume,
  updateStatus,
  shortlist,
  reject,
} = require("../controllers/application.controller");
const { updateStatusSchema } = require("../validators/application.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/mine", authenticate, authorize("CANDIDATE"), listMyApplications);
router.get("/:id", authenticate, getApplicationById);
router.get("/:id/resume", authenticate, getCandidateResume);
router.patch("/:id/status", authenticate, authorize("RECRUITER"), validate(updateStatusSchema), updateStatus);
router.post("/:id/shortlist", authenticate, authorize("RECRUITER"), shortlist);
router.post("/:id/reject", authenticate, authorize("RECRUITER"), reject);

module.exports = router;
