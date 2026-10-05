const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");

async function getMyCompany(userId) {
  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId },
    include: { company: true },
  });

  if (!recruiter) throw ApiError.notFound("Recruiter profile not found");
  return recruiter.company;
}

// Creates the recruiter's company on first save, updates it on every save
// after that — the recruiter never has to think about "create vs edit".
async function upsertMyCompany(userId, data) {
  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId } });
  if (!recruiter) throw ApiError.notFound("Recruiter profile not found");

  const payload = {
    name: data.name,
    website: data.website || null,
    logoUrl: data.logoUrl || null,
    about: data.about || null,
  };

  if (recruiter.companyId) {
    return prisma.company.update({ where: { id: recruiter.companyId }, data: payload });
  }

  const company = await prisma.company.create({ data: payload });
  await prisma.recruiterProfile.update({
    where: { userId },
    data: { companyId: company.id },
  });
  return company;
}

module.exports = { getMyCompany, upsertMyCompany };
