const { z } = require("zod");

const interviewQuestionSchema = z.object({
  question: z.string().min(10).max(600),
});

// Five fixed, measurable criteria — matches the product's "explainable
// intelligence" principle. The AI scores content only; it is explicitly
// told never to factor in protected characteristics.
const interviewEvaluationSchema = z.object({
  technicalAccuracy: z.coerce.number().min(0).max(100),
  communication: z.coerce.number().min(0).max(100),
  problemSolving: z.coerce.number().min(0).max(100),
  confidence: z.coerce.number().min(0).max(100),
  relevance: z.coerce.number().min(0).max(100),
  feedback: z.string().min(5).max(500),
});

module.exports = { interviewQuestionSchema, interviewEvaluationSchema };
