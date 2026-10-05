const { z } = require("zod");

const questionSchema = z
  .object({
    type: z.enum(["MCQ", "SUBJECTIVE"]),
    text: z.string().min(3, "Question text is required"),
    options: z.array(z.string().min(1)).max(6).optional(),
    correctIndex: z.number().int().min(0).optional(),
    order: z.number().int().min(0).default(0),
  })
  .refine((q) => q.type !== "MCQ" || (q.options && q.options.length >= 2), {
    message: "MCQ questions need at least 2 options",
    path: ["options"],
  })
  .refine((q) => q.type !== "MCQ" || q.correctIndex !== undefined, {
    message: "MCQ questions need a correct answer selected",
    path: ["correctIndex"],
  });

const createAssessmentSchema = z.object({
  jobId: z.string().min(1),
  title: z.string().min(3, "Title is required"),
  durationMinutes: z.coerce.number().int().min(5).max(180).default(30),
  questions: z.array(questionSchema).min(1, "Add at least one question").max(30),
});

const updateAssessmentSchema = z.object({
  title: z.string().min(3).optional(),
  durationMinutes: z.coerce.number().int().min(5).max(180).optional(),
  questions: z.array(questionSchema).min(1).max(30).optional(),
});

const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selectedIndex: z.number().int().min(0).optional(),
        textAnswer: z.string().max(5000).optional(),
      })
    )
    .default([]),
});

module.exports = { createAssessmentSchema, updateAssessmentSchema, submitAttemptSchema };
