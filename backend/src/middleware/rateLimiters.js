const rateLimit = require("express-rate-limit");

// Tighter limit specifically for credential-guessing-prone endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
});

// Every hit costs a real OpenAI API call (interview question generation,
// answer evaluation, resume parsing is queued separately via BullMQ) —
// this keeps a single account from burning through the API key.
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please slow down and try again shortly.",
    errorCode: "RATE_LIMITED",
  },
});

// File uploads are heavier (disk/Cloudinary I/O) and each one enqueues a
// paid AI call downstream via the worker — limit more tightly than
// general API traffic.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many uploads. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
});

module.exports = { authLimiter, aiLimiter, uploadLimiter };
