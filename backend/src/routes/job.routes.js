const express = require("express");
const {
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  getJob,
  listMyJobs,
  listPublicJobs,
  listJobsForCandidate,
  getJobMatch,
} = require("../controllers/job.controller");
const { applyToJob, listApplicantsForJob } = require("../controllers/application.controller");
const { createJobSchema, updateJobSchema } = require("../validators/job.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Order matters: specific paths before /:id so Express doesn't treat
// "mine"/"discover" as a job id.
router.get("/mine", authenticate, authorize("RECRUITER"), listMyJobs);
router.get("/discover", authenticate, authorize("CANDIDATE"), listJobsForCandidate);
router.get("/", listPublicJobs);
router.get("/:id/match", authenticate, authorize("CANDIDATE"), getJobMatch);
router.get("/:id/applicants", authenticate, authorize("RECRUITER"), listApplicantsForJob);
router.post("/:id/apply", authenticate, authorize("CANDIDATE"), applyToJob);
router.get("/:id", getJob);

router.post("/", authenticate, authorize("RECRUITER"), validate(createJobSchema), createJob);
router.put("/:id", authenticate, authorize("RECRUITER"), validate(updateJobSchema), updateJob);
router.delete("/:id", authenticate, authorize("RECRUITER"), deleteJob);
router.patch("/:id/publish", authenticate, authorize("RECRUITER"), publishJob);

module.exports = router;
