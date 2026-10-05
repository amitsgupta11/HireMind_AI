// Low-level AI service client — every AI feature in HireMind AI (resume
// parsing, interview question generation, answer evaluation) goes
// through this one function, so retries, JSON-mode, and error handling
// live in exactly one place.
//
// Provider-agnostic: works with ANY OpenAI-compatible chat-completions
// endpoint — Google Gemini (free), Groq (free), OpenAI (paid), etc. —
// just by changing three environment variables:
//   AI_API_KEY   the provider's key
//   AI_BASE_URL  the provider's OpenAI-compatible base URL
//   AI_MODEL     the model name to use
// (The older OPENAI_API_KEY / OPENAI_MODEL names still work as a fallback.)
//
// CRITICAL: if no API key is configured, this throws a clear error rather
// than returning fabricated data. Unlike storage or email, AI output can
// never have a "dev fallback" that looks real — that would be exactly the
// fake-AI-response problem this project must avoid.

function getConfig() {
  // Read lazily (at call time, not at module load) so it never depends on
  // whether dotenv finished loading before this file was first required.
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
  const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  return { apiKey, baseUrl, model };
}

function isAiConfigured() {
  return Boolean(getConfig().apiKey);
}

// Some models ignore JSON mode and wrap their answer in ```json fences —
// strip them so JSON.parse in the callers still works.
function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callChatCompletions({ apiKey, baseUrl, model, system, user, maxTokens, useJsonMode }) {
  const body = {
    model,
    // Generous on purpose: newer "thinking" models spend part of this
    // budget on hidden reasoning, and a too-small limit would cut the JSON off.
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (useJsonMode) body.response_format = { type: "json_object" };

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
}

async function completeJSON({ system, user, maxTokens = 4096 }) {
  const { apiKey, baseUrl, model } = getConfig();

  if (!apiKey) {
    throw new Error("AI service is not configured — set AI_API_KEY in backend/.env");
  }

  let res = await callChatCompletions({ apiKey, baseUrl, model, system, user, maxTokens, useJsonMode: true });

  // Free tiers have per-minute limits — wait a few seconds and retry once
  // before giving up.
  if (res.status === 429) {
    await sleep(5000);
    res = await callChatCompletions({ apiKey, baseUrl, model, system, user, maxTokens, useJsonMode: true });
  }

  // A few providers/models reject the JSON-mode parameter. Retry without
  // it — our callers validate the output against a strict schema anyway.
  if (res.status === 400) {
    const errText = await res.text().catch(() => "");
    if (errText.toLowerCase().includes("response_format") || errText.toLowerCase().includes("json")) {
      res = await callChatCompletions({ apiKey, baseUrl, model, system, user, maxTokens, useJsonMode: false });
    } else {
      throw new Error(`AI request failed (HTTP 400): ${errText.slice(0, 300)}`);
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new Error("AI provider rate limit reached — wait a minute and try again");
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("AI provider rejected the API key — check AI_API_KEY in backend/.env");
    }
    throw new Error(`AI request failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("AI response contained no content");

  return stripCodeFences(raw);
}

module.exports = {
  completeJSON,
  isAiConfigured,
  get AI_CONFIGURED() {
    return isAiConfigured();
  },
};
