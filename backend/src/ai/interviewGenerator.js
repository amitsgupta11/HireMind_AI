const { completeJSON } = require("./aiClient");
const { interviewQuestionSchema } = require("./schemas/interview.schema");

const SYSTEM_PROMPT = `You are conducting a structured technical interview for a job candidate. Ask ONE clear, specific question at a time based on the job description and the candidate's resume skills. Prefer scenario-based or "how would you..." questions over yes/no questions. Never repeat a question already asked. Never ask about protected characteristics (age, religion, race, gender, disability, marital status, etc.) — technical and role-relevant questions only.

Respond with STRICT JSON only: { "question": string }`;

async function generateNextQuestion({ jobTitle, jobDescription, candidateSkills, previousQA }) {
  const context = [
    `Job title: ${jobTitle}`,
    `Job description: ${jobDescription.slice(0, 2000)}`,
    `Candidate's resume skills: ${(candidateSkills || []).join(", ") || "not available"}`,
  ];

  if (previousQA && previousQA.length > 0) {
    context.push("Previous questions and answers in this interview:");
    previousQA.forEach((qa, i) => {
      context.push(`Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`);
    });
    context.push("Ask a NEW question that has not been asked yet, probing a different angle.");
  } else {
    context.push("This is the first question of the interview.");
  }

  const raw = await completeJSON({ system: SYSTEM_PROMPT, user: context.join("\n\n") });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`AI did not return valid JSON for interview question: ${err.message}`);
  }

  const result = interviewQuestionSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI question output failed schema validation: ${JSON.stringify(result.error.flatten())}`);
  }

  return result.data.question;
}

module.exports = { generateNextQuestion };
