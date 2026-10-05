const { calculateResumeScore, deriveInsights } = require("../src/services/resumeScoring.service");

describe("calculateResumeScore", () => {
  it("gives a low score to a nearly empty resume", () => {
    const parsed = { skills: [], education: [], experience: [], projects: [], certifications: [] };
    const score = calculateResumeScore(parsed);
    expect(score.overall).toBeLessThan(30);
    expect(score.breakdown.education).toBe(40); // no degree listed
  });

  it("gives a high score to a strong resume", () => {
    const parsed = {
      skills: Array.from({ length: 12 }, (_, i) => `Skill${i}`),
      education: [{ degree: "B.Tech", institution: "IIT", year: "2020" }],
      experience: [{ title: "Engineer", company: "Acme", durationYears: 5, description: "" }],
      projects: [{ name: "A" }, { name: "B" }],
      certifications: ["AWS Certified"],
    };
    const score = calculateResumeScore(parsed);
    expect(score.overall).toBeGreaterThan(85);
    expect(score.breakdown.skills).toBe(100); // 12 skills caps at 10 -> 100%
  });

  it("is deterministic — same input always gives the same output", () => {
    const parsed = { skills: ["A", "B"], education: [], experience: [], projects: [], certifications: [] };
    const first = calculateResumeScore(parsed);
    const second = calculateResumeScore(parsed);
    expect(first).toEqual(second);
  });
});

describe("deriveInsights", () => {
  it("flags a narrow skill set as a weakness with a matching recommendation", () => {
    const parsed = { skills: ["A"], education: [{ degree: "BSc" }], experience: [], projects: [], certifications: [] };
    const score = calculateResumeScore(parsed);
    const insights = deriveInsights(parsed, score);
    expect(insights.weaknesses.some((w) => w.toLowerCase().includes("narrow"))).toBe(true);
    expect(insights.recommendations.length).toBeGreaterThan(0);
  });
});
