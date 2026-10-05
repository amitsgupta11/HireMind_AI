// Deterministic aggregation — the AI evaluates each individual answer
// (interviewEvaluator.js), but the FINAL interview score is always a
// plain average computed here, never asked from the AI as one number.
const CRITERIA = ["technicalAccuracy", "communication", "problemSolving", "confidence", "relevance"];

const CRITERIA_LABEL = {
  technicalAccuracy: "Technical Accuracy",
  communication: "Communication",
  problemSolving: "Problem Solving",
  confidence: "Confidence",
  relevance: "Relevance",
};

function aggregateInterviewScore(answers) {
  if (!answers || answers.length === 0) return null;

  const breakdown = {};
  for (const criterion of CRITERIA) {
    const sum = answers.reduce((total, a) => total + (a[criterion] || 0), 0);
    breakdown[criterion] = Math.round(sum / answers.length);
  }

  const overall = Math.round(CRITERIA.reduce((sum, c) => sum + breakdown[c], 0) / CRITERIA.length);

  return { overall, breakdown };
}

// A short, rule-based summary derived from the breakdown numbers — not a
// separate AI call, so it can never say something the scores don't back up.
function buildSummary(breakdown) {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const strongest = entries[0];
  const weakest = entries[entries.length - 1];

  return `Strongest area: ${CRITERIA_LABEL[strongest[0]]} (${strongest[1]}/100). Area to focus on: ${CRITERIA_LABEL[weakest[0]]} (${weakest[1]}/100).`;
}

module.exports = { aggregateInterviewScore, buildSummary, CRITERIA, CRITERIA_LABEL };
