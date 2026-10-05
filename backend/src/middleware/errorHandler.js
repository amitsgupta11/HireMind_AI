const ApiError = require("../utils/ApiError");

// Centralized error handler — every API response follows the same shape:
// { success: false, message, errorCode, details? }
// Stack traces are never sent to the client in production.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const errorCode = isApiError ? err.errorCode : "INTERNAL_ERROR";
  const message = isApiError ? err.message : "Something went wrong";

  if (!isApiError) {
    // Unexpected error — log full details server-side only.
    console.error("[UNHANDLED_ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(process.env.NODE_ENV === "development" && !isApiError
      ? { debugStack: err.stack }
      : {}),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errorCode: "ROUTE_NOT_FOUND",
  });
}

module.exports = { errorHandler, notFoundHandler };
