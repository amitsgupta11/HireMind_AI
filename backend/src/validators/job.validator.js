const { z } = require("zod");

const skillArray = z
  .array(z.string().min(1).max(40))
  .max(20, "Keep it to 20 skills or fewer");

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

// Shared by create + update — update just makes everything optional via .partial().
const jobBaseSchema = z
  .object({
    title: z.string().min(3, "Job title is required"),
    description: z.string().min(20, "Description should be at least 20 characters"),
    location: z.string().min(2, "Location is required"),
    employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
    experienceMin: z.coerce.number().int().min(0).default(0),
    experienceMax: z.coerce.number().int().min(0).optional(),
    salaryMin: z.coerce.number().int().min(0).optional(),
    salaryMax: z.coerce.number().int().min(0).optional(),
    requiredSkills: skillArray.min(1, "Add at least one required skill"),
    preferredSkills: skillArray.optional().default([]),
    isPublished: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.experienceMax === undefined || data.experienceMax >= data.experienceMin,
    { message: "Max experience must be greater than or equal to min experience", path: ["experienceMax"] }
  )
  .refine(
    (data) => data.salaryMax === undefined || data.salaryMin === undefined || data.salaryMax >= data.salaryMin,
    { message: "Max salary must be greater than or equal to min salary", path: ["salaryMax"] }
  );

const createJobSchema = jobBaseSchema;

// Partial update — same rules, but every field is optional so callers can
// PATCH a single step's worth of data without resending everything.
const updateJobSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(20).optional(),
  location: z.string().min(2).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  experienceMin: z.coerce.number().int().min(0).optional(),
  experienceMax: z.coerce.number().int().min(0).optional(),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  requiredSkills: skillArray.optional(),
  preferredSkills: skillArray.optional(),
  isPublished: z.boolean().optional(),
});

module.exports = { createJobSchema, updateJobSchema, EMPLOYMENT_TYPES };
