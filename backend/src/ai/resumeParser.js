const { completeJSON } = require("./aiClient");
const { resumeParseSchema } = require("./schemas/resumeParse.schema");

const SYSTEM_PROMPT = `You extract structured facts from resumes. Only extract what is explicitly present in the text — never invent skills, employers, dates, or achievements that aren't there. If a section has no information, return an empty array for it.

Respond with STRICT JSON only, no markdown, no commentary, matching exactly this shape:
{
  "skills": string[],
  "education": [{ "degree": string, "institution": string, "year": string }],
  "experience": [{ "title": string, "company": string, "durationYears": number, "description": string }],
  "projects": [{ "name": string, "description": string }],
  "certifications": string[]
}`;

const MAX_INPUT_CHARS = 12000; // keeps prompt size (and cost) predictable

// Extracts structured facts from raw resume text using the AI, then
// validates the result against a strict schema before returning it.
// Retries once on a malformed response — a second consecutive failure
// means something is genuinely wrong (bad key, bad prompt, model drift),
// not a fluke worth retrying further.
async function parseResumeText(extractedText) {
  const truncated = extractedText.slice(0, MAX_INPUT_CHARS);
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await completeJSON({
        system: SYSTEM_PROMPT,
        user: `Resume text:\n\n${truncated}`,
      });

      let parsedJson;
      try {
        parsedJson = JSON.parse(raw);
      } catch (jsonErr) {
        throw new Error(`AI did not return valid JSON: ${jsonErr.message}`);
      }

      const result = resumeParseSchema.safeParse(parsedJson);
      if (!result.success) {
        throw new Error(`AI output failed schema validation: ${JSON.stringify(result.error.flatten())}`);
      }

      return result.data;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}

module.exports = { parseResumeText };
