const multer = require("multer");
const ApiError = require("../utils/ApiError");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — resumes are never bigger than this in practice

// In-memory storage: files are buffered, validated, and handed to the
// storage service (S3 or dev-fallback disk) — never written to a temp
// path we'd have to clean up ourselves.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(ApiError.badRequest("Only PDF files are accepted", "INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

// Wraps multer so its errors (wrong type, too large) come out as our
// standard { success:false, message, errorCode } shape instead of a raw
// multer stack trace.
function handleResumeUpload(req, res, next) {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof ApiError) return next(err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return next(ApiError.badRequest("File is too large — 5MB maximum", "FILE_TOO_LARGE"));
    }

    next(ApiError.badRequest("File upload failed", "FILE_UPLOAD_ERROR"));
  });
}

module.exports = { handleResumeUpload, MAX_FILE_SIZE };
