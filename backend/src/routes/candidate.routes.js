const express = require("express");
const { getMyProfile, updateMyProfile } = require("../controllers/candidate.controller");
const { updateProfileSchema } = require("../validators/candidate.validator");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/me", authenticate, authorize("CANDIDATE"), getMyProfile);
router.put("/me", authenticate, authorize("CANDIDATE"), validate(updateProfileSchema), updateMyProfile);

module.exports = router;
