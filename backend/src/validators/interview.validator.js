const { z } = require("zod");

const startInterviewSchema = z.object({
  applicationId: z.string().min(1, "applicationId is required"),
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  answerText: z.string().min(1, "Answer cannot be empty").max(5000),
});

module.exports = { startInterviewSchema, answerSchema };
