// Deterministic Job Match calculation — AI plays no role here at all.
// Skill matching is plain, explainable set comparison against the
// candidate's AI-extracted resume skills (Phase 6).
//
// Weights (documented here, not scattered across the UI):
//   Match Score =
//       70% Required skills matched  -> matchedRequired / totalRequired
//     + 15% Preferred skills matched -> matchedPreferred / totalPreferred
//     + 15% Experience fit           -> min(candidateYears / job.experienceMin, 1) * 100
//   (Education is intentionally excluded — Job has no structured education
//   requirement field in this schema, so we never fabricate one; its 5%
//   from the original spec is folded into Experience instead.)
const ApiError = require("../utils/ApiError");

function normalize(name) {
  return name.trim().toLowerCase();
}

function calculateJobMatch(candidateSkills, candidateExperienceYears, job) {
  const requiredSkills = job.skills.filter((s) => s.level === "REQUIRED").map((s) => s.name);
  const preferredSkills = job.skills.filter((s) => s.level === "PREFERRED").map((s) => s.name);
  const candidateSet = new Set((candidateSkills || []).map(normalize));

  const matchedRequired = requiredSkills.filter((s) => candidateSet.has(normalize(s)));
  const matchedPreferred = preferredSkills.filter((s) => candidateSet.has(normalize(s)));
  const missingRequired = requiredSkills.filter((s) => !candidateSet.has(normalize(s)));
  const missingPreferred = preferredSkills.filter((s) => !candidateSet.has(normalize(s)));

  const requiredScore = requiredSkills.length
    ? (matchedRequired.length / requiredSkills.length) * 100
    : 100;
  const preferredScore = preferredSkills.length
    ? (matchedPreferred.length / preferredSkills.length) * 100
    : 100;
  const experienceScore =
    job.experienceMin > 0
      ? Math.min((candidateExperienceYears || 0) / job.experienceMin, 1) * 100
      : 100;

  const overall = Math.round(requiredScore * 0.7 + preferredScore * 0.15 + experienceScore * 0.15);

  return {
    overall,
    breakdown: {
      requiredSkills: Math.round(requiredScore),
      preferredSkills: Math.round(preferredScore),
      experience: Math.round(experienceScore),
    },
    matchedSkills: [...matchedRequired, ...matchedPreferred],
    missingSkills: [...missingRequired, ...missingPreferred],
  };
}

// Pulls the candidate's total years of experience straight from their
// latest completed resume analysis — the same numbers resumeScoring.js
// used, so match% and resume score are always consistent with each other.
function totalExperienceYears(resume) {
  if (!resume || !resume.experience) return 0;
  return resume.experience.reduce((sum, e) => sum + (e.durationYears || 0), 0);
}

function assertResumeReady(resume) {
  if (!resume || resume.status !== "COMPLETED") {
    throw ApiError.badRequest(
      "Complete your resume analysis before viewing job matches",
      "RESUME_NOT_READY"
    );
  }
}

module.exports = { calculateJobMatch, totalExperienceYears, assertResumeReady };
