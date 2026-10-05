const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const ApiError = require("../utils/ApiError");

// Verifies the Bearer JWT and attaches { id, role } to req.user.
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(ApiError.unauthorized("Missing or invalid Authorization header"));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    next(ApiError.unauthorized("Invalid or expired token", "TOKEN_INVALID"));
  }
}

// Role-based access control — usage: authorize("RECRUITER", "ADMIN")
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have access to this resource"));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
