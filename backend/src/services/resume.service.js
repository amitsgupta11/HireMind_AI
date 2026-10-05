const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const storageService = require("./storage.service");
const resumeQueue = require("../queues/resumeQueue");

async function uploadResume(userId, file) {
  if (!file) {
    throw ApiError.badRequest("No file was uploaded", "FILE_REQUIRED");
  }

  const { key, url, storedLocally } = await storageService.uploadFile({
    buffer: file.buffer,
    fileName: file.originalname,
    keyPrefix: `resumes/${userId}`,
  });

  let resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.originalname,
      storageKey: key,
      fileUrl: url,
      storedLocally,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      status: "UPLOADED",
    },
  });

  // Enqueue for background processing (Phase 5 worker). If Redis is
  // unreachable, the resume stays real — it's marked FAILED with the
  // actual reason rather than silently pretending it was queued.
  try {
    await resumeQueue.add("process-resume", { resumeId: resume.id });
    resume = await prisma.resume.update({ where: { id: resume.id }, data: { status: "QUEUED" } });
  } catch (err) {
    console.error("[resume.service] Failed to enqueue resume for processing:", err.message);
    resume = await prisma.resume.update({
      where: { id: resume.id },
      data: { status: "FAILED", failureReason: "Could not queue for background processing" },
    });
  }

  return { resume, storedLocally };
}

async function listMyResumes(userId) {
  return prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function getLatestResume(userId) {
  return prisma.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

async function getResumeById(id, userId) {
  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) throw ApiError.notFound("Resume not found");
  if (resume.userId !== userId) throw ApiError.forbidden("You do not have access to this resume");
  return resume;
}

module.exports = { uploadResume, listMyResumes, getLatestResume, getResumeById };
