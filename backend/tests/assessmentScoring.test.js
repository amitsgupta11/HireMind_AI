const { scoreAttempt } = require("../src/services/assessmentScoring.service");

describe("scoreAttempt", () => {
  const questions = [
    { id: "q1", type: "MCQ", correctIndex: 1 },
    { id: "q2", type: "MCQ", correctIndex: 0 },
    { id: "q3", type: "SUBJECTIVE" },
  ];

  it("awards +4 for a correct MCQ answer", () => {
    const result = scoreAttempt(questions, [{ questionId: "q1", selectedIndex: 1 }]);
    const q1Result = result.perQuestionResults.find((r) => r.questionId === "q1");
    expect(q1Result.isCorrect).toBe(true);
    expect(q1Result.pointsAwarded).toBe(4);
  });

  it("deducts -1 for a wrong MCQ answer", () => {
    const result = scoreAttempt(questions, [{ questionId: "q1", selectedIndex: 0 }]);
    const q1Result = result.perQuestionResults.find((r) => r.questionId === "q1");
    expect(q1Result.isCorrect).toBe(false);
    expect(q1Result.pointsAwarded).toBe(-1);
  });

  it("awards 0 for an unanswered MCQ question, not -1", () => {
    const result = scoreAttempt(questions, []);
    const q1Result = result.perQuestionResults.find((r) => r.questionId === "q1");
    expect(q1Result.pointsAwarded).toBe(0);
  });

  it("never lets the normalized score go negative even with all wrong answers", () => {
    const result = scoreAttempt(questions, [
      { questionId: "q1", selectedIndex: 0 },
      { questionId: "q2", selectedIndex: 1 },
    ]);
    expect(result.normalizedScore).toBeGreaterThanOrEqual(0);
  });

  it("never auto-scores subjective questions", () => {
    const result = scoreAttempt(questions, [{ questionId: "q3", textAnswer: "my answer" }]);
    const q3Result = result.perQuestionResults.find((r) => r.questionId === "q3");
    expect(q3Result.isCorrect).toBeNull();
    expect(q3Result.pointsAwarded).toBeNull();
  });

  it("returns null normalizedScore when there are no MCQ questions at all", () => {
    const result = scoreAttempt([{ id: "q1", type: "SUBJECTIVE" }], []);
    expect(result.normalizedScore).toBeNull();
  });
});
