const { z } = require("zod");

const VALID_STATUSES = [
  "APPLIED",
  "UNDER_REVIEW",
  "ASSESSMENT_ASSIGNED",
  "INTERVIEW_ASSIGNED",
  "SHORTLISTED",
  "REJECTED",
];

const updateStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, { errorMap: () => ({ message: "Invalid application status" }) }),
});

module.exports = { updateStatusSchema, VALID_STATUSES };
