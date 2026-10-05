const resumeService = require("../services/resume.service");
const asyncHandler = require("../utils/asyncHandler");

const uploadResume = asyncHandler(async (req, res) => {
  const { resume, storedLocally } = await resumeService.uploadResume(req.user.id, req.file);
  res.status(201).json({
    success: true,
    data: { resume, storedLocally },
  });
});

const listMyResumes = asyncHandler(async (req, res) => {
  const resumes = await resumeService.listMyResumes(req.user.id);
  res.status(200).json({ success: true, data: { resumes } });
});

const getLatestResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getLatestResume(req.user.id);
  res.status(200).json({ success: true, data: { resume } });
});

const getResumeById = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { resume } });
});

// Same ownership-checked resume, shaped down to just the Resume
// Intelligence fields the dedicated report view needs — matches the
// project's documented API surface (GET /api/resumes/:id/intelligence).
const getResumeIntelligence = asyncHandler(async (req, res) => {
  const resume = await resumeService.getResumeById(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    data: {
      status: resume.status,
      failureReason: resume.failureReason,
      resumeScore: resume.resumeScore,
      scoreBreakdown: resume.scoreBreakdown,
      skills: resume.skills,
      education: resume.education,
      experience: resume.experience,
      projects: resume.projects,
      certifications: resume.certifications,
      strengths: resume.strengths,
      weaknesses: resume.weaknesses,
      recommendations: resume.recommendations,
      aiProcessedAt: resume.aiProcessedAt,
    },
  });
});

module.exports = { uploadResume, listMyResumes, getLatestResume, getResumeById, getResumeIntelligence };
