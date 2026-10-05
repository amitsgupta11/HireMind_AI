const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

async function getMyProfile(userId) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Candidate profile not found");
  return profile;
}

async function updateMyProfile(userId, data) {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound("Candidate profile not found");

  return prisma.candidateProfile.update({
    where: { userId },
    data: {
      fullName: data.fullName,
      headline: data.headline || null,
      location: data.location || null,
      phone: data.phone || null,
    },
  });
}

module.exports = { getMyProfile, updateMyProfile };
