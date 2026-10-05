const ApiError = require("../utils/ApiError");

// Validates req.body against a Zod schema. On failure, throws a 400
// ApiError with field-level details — never lets bad input reach services.
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    return next(ApiError.badRequest("Validation failed", "VALIDATION_ERROR", details));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
