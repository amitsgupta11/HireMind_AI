// Deterministic MCQ scoring — never AI-judged. Subjective answers are
// stored for the recruiter to read but are never auto-scored, since that
// would mean fabricating a judgment call a human should make.
//
// Rule: correct = +4, wrong (answered but incorrect) = -1, left blank = 0.
// The raw sum is floored at 0 and normalized to a 0-100 scale against the
// maximum possible MCQ score, so it's comparable across assessments with
// different question counts.
function scoreAttempt(questions, submittedAnswers) {
  const mcqQuestions = questions.filter((q) => q.type === "MCQ");
  const maxScore = mcqQuestions.length * 4;

  const answerByQuestionId = new Map(submittedAnswers.map((a) => [a.questionId, a]));

  const perQuestionResults = questions.map((q) => {
    const submitted = answerByQuestionId.get(q.id);

    if (q.type !== "MCQ") {
      return {
        questionId: q.id,
        type: q.type,
        textAnswer: submitted?.textAnswer || "",
        isCorrect: null,
        pointsAwarded: null,
      };
    }

    if (submitted?.selectedIndex === undefined || submitted?.selectedIndex === null) {
      return { questionId: q.id, type: q.type, selectedIndex: null, isCorrect: false, pointsAwarded: 0 };
    }

    const isCorrect = submitted.selectedIndex === q.correctIndex;
    return {
      questionId: q.id,
      type: q.type,
      selectedIndex: submitted.selectedIndex,
      isCorrect,
      pointsAwarded: isCorrect ? 4 : -1,
    };
  });

  const rawScore = perQuestionResults
    .filter((r) => r.type === "MCQ")
    .reduce((sum, r) => sum + r.pointsAwarded, 0);

  const normalizedScore = maxScore > 0 ? Math.round((Math.max(rawScore, 0) / maxScore) * 100) : null;

  return { normalizedScore, maxScore, rawScore, perQuestionResults };
}

module.exports = { scoreAttempt };
