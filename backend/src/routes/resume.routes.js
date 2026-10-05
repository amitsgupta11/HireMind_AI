const express = require("express");
const {
  uploadResume,
  listMyResumes,
  getLatestResume,
  getResumeById,
  getResumeIntelligence,
} = require("../controllers/resume.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const { handleResumeUpload } = require("../middleware/upload.middleware");
const { uploadLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/upload", authenticate, authorize("CANDIDATE"), uploadLimiter, handleResumeUpload, uploadResume);
router.get("/mine", authenticate, authorize("CANDIDATE"), listMyResumes);
router.get("/latest", authenticate, authorize("CANDIDATE"), getLatestResume);
router.get("/:id/intelligence", authenticate, getResumeIntelligence);
router.get("/:id", authenticate, getResumeById);

module.exports = router;
