const { z } = require("zod");

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  headline: z.string().max(150, "Keep it under 150 characters").optional().or(z.literal("")),
  location: z.string().max(120, "Keep it under 120 characters").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

module.exports = { updateProfileSchema };
