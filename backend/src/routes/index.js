const express = require("express");
const authRoutes = require("./auth.routes");
const companyRoutes = require("./company.routes");
const jobRoutes = require("./job.routes");
const candidateRoutes = require("./candidate.routes");
const resumeRoutes = require("./resume.routes");
const applicationRoutes = require("./application.routes");
const notificationRoutes = require("./notification.routes");
const assessmentRoutes = require("./assessment.routes");
const interviewRoutes = require("./interview.routes");
const intelligenceRoutes = require("./intelligence.routes");
const adminRoutes = require("./admin.routes");
const analyticsRoutes = require("./analytics.routes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "HireMind AI API is healthy" });
});

router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/candidates", candidateRoutes);
router.use("/resumes", resumeRoutes);
router.use("/applications", applicationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/interviews", interviewRoutes);
router.use("/intelligence", intelligenceRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;
