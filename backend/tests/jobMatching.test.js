const { calculateJobMatch, totalExperienceYears } = require("../src/services/jobMatching.service");

function makeJob(skills, experienceMin = 0) {
  return { skills, experienceMin };
}

describe("calculateJobMatch", () => {
  it("scores 100% when every required and preferred skill matches", () => {
    const job = makeJob([
      { name: "React", level: "REQUIRED" },
      { name: "Node.js", level: "REQUIRED" },
      { name: "Docker", level: "PREFERRED" },
    ]);
    const result = calculateJobMatch(["React", "Node.js", "Docker"], 5, job);
    expect(result.overall).toBe(100);
    expect(result.missingSkills).toHaveLength(0);
  });

  it("is case-insensitive when comparing skills", () => {
    const job = makeJob([{ name: "React", level: "REQUIRED" }]);
    const result = calculateJobMatch(["react"], 0, job);
    expect(result.matchedSkills).toContain("React");
  });

  it("lists missing required skills separately from preferred", () => {
    const job = makeJob([
      { name: "React", level: "REQUIRED" },
      { name: "GraphQL", level: "PREFERRED" },
    ]);
    const result = calculateJobMatch([], 0, job);
    expect(result.missingSkills).toEqual(expect.arrayContaining(["React", "GraphQL"]));
    expect(result.breakdown.requiredSkills).toBe(0);
  });

  it("caps experience score at 100% even with more experience than required", () => {
    const job = makeJob([], 2);
    const result = calculateJobMatch([], 10, job);
    expect(result.breakdown.experience).toBe(100);
  });
});

describe("totalExperienceYears", () => {
  it("sums durationYears across all experience entries", () => {
    const resume = { experience: [{ durationYears: 2 }, { durationYears: 3.5 }] };
    expect(totalExperienceYears(resume)).toBe(5.5);
  });

  it("returns 0 for a resume with no experience data", () => {
    expect(totalExperienceYears({ experience: [] })).toBe(0);
    expect(totalExperienceYears(null)).toBe(0);
  });
});
