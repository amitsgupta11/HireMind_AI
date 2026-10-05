const { z } = require("zod");

const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  website: z
    .string()
    .url("Enter a valid URL (include https://)")
    .optional()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  about: z.string().max(2000, "Keep it under 2000 characters").optional().or(z.literal("")),
});

module.exports = { companySchema };
