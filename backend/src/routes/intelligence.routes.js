const express = require("express");
const { getForApplication } = require("../controllers/intelligence.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/application/:applicationId", authenticate, getForApplication);

module.exports = router;
