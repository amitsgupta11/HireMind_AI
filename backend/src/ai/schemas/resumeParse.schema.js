const { z } = require("zod");

// The AI's raw output is NEVER trusted directly — every field is
// validated against this schema before it touches the database. If the
// AI returns something malformed, resumeParser.js retries once, then
// fails the job honestly rather than saving garbage.
const resumeParseSchema = z.object({
  skills: z.array(z.string().min(1).max(60)).max(40).default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(""),
        institution: z.string().default(""),
        year: z.string().default(""),
      })
    )
    .max(10)
    .default([]),
  experience: z
    .array(
      z.object({
        title: z.string().default(""),
        company: z.string().default(""),
        durationYears: z.coerce.number().min(0).max(50).default(0),
        description: z.string().default(""),
      })
    )
    .max(15)
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(""),
        description: z.string().default(""),
      })
    )
    .max(15)
    .default([]),
  certifications: z.array(z.string().min(1).max(120)).max(20).default([]),
});

module.exports = { resumeParseSchema };
