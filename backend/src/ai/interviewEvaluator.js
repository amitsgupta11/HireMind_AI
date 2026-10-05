const { completeJSON } = require("./aiClient");
const { interviewEvaluationSchema } = require("./schemas/interview.schema");

const SYSTEM_PROMPT = `You evaluate a candidate's interview answer against five criteria, each scored 0-100:
- technicalAccuracy: correctness and depth of technical content
- communication: clarity and structure of the explanation
- problemSolving: quality of the approach/reasoning shown
- confidence: how directly and assuredly the answer is delivered (based on content only, not identity)
- relevance: how well the answer actually addresses the question asked

Score the CONTENT of the answer only. Never let religion, race, caste, gender, disability, age, marital status, or any other protected characteristic influence any score, even if mentioned in the answer.

Respond with STRICT JSON only:
{ "technicalAccuracy": number, "communication": number, "problemSolving": number, "confidence": number, "relevance": number, "feedback": string }
"feedback" is 1-2 sentences of constructive, specific feedback on this answer.`;

async function evaluateAnswer({ question, answerText }) {
  const user = `Question: ${question}\n\nCandidate's answer: ${answerText.slice(0, 3000)}`;

  const raw = await completeJSON({ system: SYSTEM_PROMPT, user });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`AI did not return valid JSON for interview evaluation: ${err.message}`);
  }

  const result = interviewEvaluationSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`AI evaluation output failed schema validation: ${JSON.stringify(result.error.flatten())}`);
  }

  return result.data;
}

module.exports = { evaluateAnswer };
