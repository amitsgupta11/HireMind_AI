// Deterministic Resume Score — the AI (resumeParser.js) only extracts
// facts from the resume text; the score itself is always computed the
// same way from those facts, so it's reproducible and explainable. We
// never ask the AI to "give this candidate a score" directly.
//
// Formula (weights live here, not scattered across the UI):
//   Resume Score =
//       35% Skills breadth    -> min(skills.length / 10, 1) * 100
//     + 30% Experience depth  -> min(totalYearsAcrossRoles / 8, 1) * 100
//     + 20% Education         -> 100 if at least one degree listed, else 40
//     + 15% Projects & Certs  -> min((projects.length + certifications.length) / 4, 1) * 100
const WEIGHTS = {
  skills: 0.35,
  experience: 0.3,
  education: 0.2,
  projectsAndCerts: 0.15,
};

function calculateResumeScore(parsed) {
  const skillsScore = Math.min(parsed.skills.length / 10, 1) * 100;

  const totalYears = parsed.experience.reduce((sum, e) => sum + (e.durationYears || 0), 0);
  const experienceScore = Math.min(totalYears / 8, 1) * 100;

  const educationScore = parsed.education.length > 0 ? 100 : 40;

  const projectsAndCertsCount = parsed.projects.length + parsed.certifications.length;
  const projectsScore = Math.min(projectsAndCertsCount / 4, 1) * 100;

  const overall =
    skillsScore * WEIGHTS.skills +
    experienceScore * WEIGHTS.experience +
    educationScore * WEIGHTS.education +
    projectsScore * WEIGHTS.projectsAndCerts;

  return {
    overall: Math.round(overall),
    breakdown: {
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      projectsAndCerts: Math.round(projectsScore),
    },
  };
}

// Rule-based, not AI-generated — kept fully transparent and testable, and
// consistent with the app's "every score comes with a reason" principle.
function deriveInsights(parsed, score) {
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (parsed.skills.length >= 8) strengths.push("Broad technical skill set");
  if (score.breakdown.experience >= 70) strengths.push("Strong depth of professional experience");
  if (parsed.projects.length >= 2) strengths.push("Demonstrated project experience");
  if (parsed.certifications.length > 0) strengths.push("Holds relevant certifications");

  if (parsed.skills.length < 5) {
    weaknesses.push("Narrow skill set listed");
    recommendations.push("Add more specific technical skills relevant to your target roles");
  }
  if (score.breakdown.experience < 40) {
    weaknesses.push("Limited professional experience detailed");
    recommendations.push("Expand on responsibilities and impact in past roles");
  }
  if (parsed.education.length === 0) {
    weaknesses.push("No education history detected");
    recommendations.push("Add your educational background");
  }
  if (parsed.certifications.length === 0) {
    recommendations.push("Consider adding certifications to strengthen your profile");
  }

  if (strengths.length === 0) {
    strengths.push("Resume successfully parsed — add more detail to strengthen your profile");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("No major gaps detected");
  }

  return { strengths, weaknesses, recommendations };
}

module.exports = { calculateResumeScore, deriveInsights };
