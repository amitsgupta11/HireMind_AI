// Consistent, typed application error used across controllers/services.
class ApiError extends Error {
  constructor(statusCode, message, errorCode = "INTERNAL_ERROR", details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }

  static badRequest(message, errorCode = "BAD_REQUEST", details = null) {
    return new ApiError(400, message, errorCode, details);
  }
  static unauthorized(message = "Unauthorized", errorCode = "UNAUTHORIZED") {
    return new ApiError(401, message, errorCode);
  }
  static forbidden(message = "Forbidden", errorCode = "FORBIDDEN") {
    return new ApiError(403, message, errorCode);
  }
  static notFound(message = "Not found", errorCode = "NOT_FOUND") {
    return new ApiError(404, message, errorCode);
  }
  static conflict(message, errorCode = "CONFLICT") {
    return new ApiError(409, message, errorCode);
  }
}

module.exports = ApiError;
