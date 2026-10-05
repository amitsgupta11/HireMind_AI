const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

async function listUsers({ role } = {}) {
  return prisma.user.findMany({
    where: role ? { role } : {},
    include: { candidateProfile: true, recruiterProfile: { include: { company: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function listCompanies() {
  return prisma.company.findMany({
    include: { _count: { select: { jobs: true, recruiters: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function listJobs() {
  return prisma.job.findMany({
    include: { company: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function setUserStatus(adminUserId, targetUserId, status) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw ApiError.notFound("User not found");
  if (user.role === "ADMIN") {
    throw ApiError.forbidden("Cannot change another admin's account status");
  }

  const updated = await prisma.user.update({ where: { id: targetUserId }, data: { status } });

  await prisma.auditLog.create({
    data: {
      actorId: adminUserId,
      action: "USER_STATUS_CHANGED",
      targetType: "User",
      targetId: targetUserId,
      metadata: { from: user.status, to: status },
    },
  });

  return updated;
}

async function getPlatformAnalytics() {
  const [
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    publishedJobs,
    totalApplications,
    resumesCompleted,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CANDIDATE" } }),
    prisma.user.count({ where: { role: "RECRUITER" } }),
    prisma.company.count(),
    prisma.job.count(),
    prisma.job.count({ where: { isPublished: true } }),
    prisma.application.count(),
    prisma.resume.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    totalUsers,
    totalCandidates,
    totalRecruiters,
    totalCompanies,
    totalJobs,
    publishedJobs,
    totalApplications,
    resumesCompleted,
  };
}

module.exports = { listUsers, listCompanies, listJobs, setUserStatus, getPlatformAnalytics };
