const express = require("express");
const { register, login, me, forgotPassword, resetPassword, changePassword } = require("../controllers/auth.controller");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authenticate, me);
router.put("/change-password", authenticate, validate(changePasswordSchema), changePassword);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), resetPassword);

module.exports = router;
