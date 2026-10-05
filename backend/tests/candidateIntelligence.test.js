const { computeOverallScore, WEIGHTS } = require("../src/services/candidateIntelligence.service");

describe("computeOverallScore", () => {
  it("returns null when no component scores exist yet", () => {
    expect(computeOverallScore({ resumeScore: null, matchScore: null, assessmentScore: null, interviewScore: null })).toBeNull();
  });

  it("matches the documented weights when all four components exist", () => {
    const values = { resumeScore: 80, matchScore: 90, assessmentScore: 70, interviewScore: 60 };
    const expected = Math.round(
      80 * WEIGHTS.resumeScore + 90 * WEIGHTS.matchScore + 70 * WEIGHTS.assessmentScore + 60 * WEIGHTS.interviewScore
    );
    expect(computeOverallScore(values)).toBe(expected);
  });

  it("rescales weights proportionally when a component is missing", () => {
    // Only resume + match exist — their weight ratio (0.30:0.25) should be preserved.
    const values = { resumeScore: 100, matchScore: 50, assessmentScore: null, interviewScore: null };
    const totalWeight = WEIGHTS.resumeScore + WEIGHTS.matchScore;
    const expected = Math.round((100 * WEIGHTS.resumeScore + 50 * WEIGHTS.matchScore) / totalWeight);
    expect(computeOverallScore(values)).toBe(expected);
  });

  it("equals the single score when only one component exists", () => {
    expect(computeOverallScore({ resumeScore: 73, matchScore: null, assessmentScore: null, interviewScore: null })).toBe(73);
  });
});
