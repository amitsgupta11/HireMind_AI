const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

// All real aggregate queries against the recruiter's own company data —
// no placeholder/sample numbers. Empty states (a brand-new company with
// no jobs yet) return empty arrays, which the frontend renders as real
// empty states, not zeroed fake charts.
async function getRecruiterAnalytics(userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter || !recruiter.companyId) {
    throw ApiError.forbidden("Create a company profile first", "NO_COMPANY");
  }

  const jobs = await prisma.job.findMany({
    where: { companyId: recruiter.companyId },
    include: { skills: true },
  });
  const jobIds = jobs.map((j) => j.id);

  const applications = jobIds.length
    ? await prisma.application.findMany({
        where: { jobId: { in: jobIds } },
        include: { candidateIntelligence: true },
      })
    : [];

  // Applications over time — last 14 days, grouped by calendar date.
  const dayBuckets = {};
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dayBuckets[d.toISOString().slice(0, 10)] = 0;
  }
  applications.forEach((a) => {
    const key = a.createdAt.toISOString().slice(0, 10);
    if (key in dayBuckets) dayBuckets[key] += 1;
  });
  const applicationsOverTime = Object.entries(dayBuckets).map(([date, count]) => ({ date, count }));

  // Candidate Intelligence score distribution.
  const scoreBuckets = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  applications.forEach((a) => {
    const score = a.candidateIntelligence?.overallScore;
    if (score == null) return;
    if (score <= 20) scoreBuckets["0-20"]++;
    else if (score <= 40) scoreBuckets["21-40"]++;
    else if (score <= 60) scoreBuckets["41-60"]++;
    else if (score <= 80) scoreBuckets["61-80"]++;
    else scoreBuckets["81-100"]++;
  });
  const scoreDistribution = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }));

  // Skill demand — most requested skills across this recruiter's job postings.
  const skillCounts = {};
  jobs.forEach((job) => {
    job.skills.forEach((s) => {
      skillCounts[s.name] = (skillCounts[s.name] || 0) + 1;
    });
  });
  const skillDemand = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Hiring funnel — applications by current status.
  const funnelOrder = ["APPLIED", "UNDER_REVIEW", "ASSESSMENT_ASSIGNED", "INTERVIEW_ASSIGNED", "SHORTLISTED", "REJECTED"];
  const funnelCounts = Object.fromEntries(funnelOrder.map((s) => [s, 0]));
  applications.forEach((a) => {
    if (a.status in funnelCounts) funnelCounts[a.status] += 1;
  });
  const hiringFunnel = funnelOrder.map((status) => ({ status, count: funnelCounts[status] }));

  return {
    totalJobs: jobs.length,
    publishedJobs: jobs.filter((j) => j.isPublished).length,
    totalApplications: applications.length,
    applicationsOverTime,
    scoreDistribution,
    skillDemand,
    hiringFunnel,
  };
}

module.exports = { getRecruiterAnalytics };
