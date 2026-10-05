const express = require("express");
const {
  listUsers,
  listCompanies,
  listJobs,
  setUserStatus,
  getPlatformAnalytics,
} = require("../controllers/admin.controller");
const { setStatusSchema } = require("../validators/admin.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/users", listUsers);
router.get("/companies", listCompanies);
router.get("/jobs", listJobs);
router.patch("/users/:id/status", validate(setStatusSchema), setUserStatus);
router.get("/analytics", getPlatformAnalytics);

module.exports = router;
