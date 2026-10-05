const { aggregateInterviewScore, buildSummary } = require("../src/services/interviewScoring.service");

describe("aggregateInterviewScore", () => {
  it("returns null when there are no answers", () => {
    expect(aggregateInterviewScore([])).toBeNull();
    expect(aggregateInterviewScore(null)).toBeNull();
  });

  it("averages each criterion across all answers", () => {
    const answers = [
      { technicalAccuracy: 80, communication: 60, problemSolving: 70, confidence: 90, relevance: 100 },
      { technicalAccuracy: 60, communication: 80, problemSolving: 70, confidence: 70, relevance: 80 },
    ];
    const result = aggregateInterviewScore(answers);
    expect(result.breakdown.technicalAccuracy).toBe(70);
    expect(result.breakdown.relevance).toBe(90);
  });

  it("overall score is the average of the 5 criteria averages", () => {
    const answers = [{ technicalAccuracy: 100, communication: 100, problemSolving: 100, confidence: 100, relevance: 100 }];
    const result = aggregateInterviewScore(answers);
    expect(result.overall).toBe(100);
  });
});

describe("buildSummary", () => {
  it("names the strongest and weakest criteria by their actual values", () => {
    const breakdown = { technicalAccuracy: 90, communication: 40, problemSolving: 70, confidence: 60, relevance: 80 };
    const summary = buildSummary(breakdown);
    expect(summary).toContain("Technical Accuracy");
    expect(summary).toContain("Communication");
  });
});
