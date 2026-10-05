// HireMind AI — Resume Processing Worker
//
// This runs as its OWN process (separate from the API server), consuming
// jobs from the "resume-processing" BullMQ queue. On Render this deploys
// as a separate "Background Worker" service — see README "Deployment".
//
// Pipeline (all real, no faked steps):
//   PROCESSING -> download the PDF, extract raw text (pdf-parse)
//   ANALYZING  -> send that text to the AI parser, validate its structured
//                 output, compute the deterministic Resume Score from it
//   COMPLETED  -> everything saved; FAILED with the real reason otherwise
require("dotenv").config();
const { Worker } = require("bullmq");
const pdfParse = require("pdf-parse");
const prisma = require("../config/prisma");
const { redisConnection } = require("../config/redis");
const storageService = require("../services/storage.service");
const { parseResumeText } = require("../ai/resumeParser");
const { calculateResumeScore, deriveInsights } = require("../services/resumeScoring.service");
const { createNotification } = require("../services/notification.service");

const MAX_STORED_TEXT_LENGTH = 20000; // cap what we store — plenty for the AI parser

async function processResumeJob(job) {
  const { resumeId } = job.data;

  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
  if (!resume) {
    throw new Error(`Resume ${resumeId} no longer exists`);
  }

  // --- Stage 1: text extraction (Phase 5) ---
  await prisma.resume.update({ where: { id: resumeId }, data: { status: "PROCESSING" } });

  const buffer = await storageService.downloadFile({
    key: resume.storageKey,
    url: resume.fileUrl,
    storedLocally: resume.storedLocally,
  });

  const parsedPdf = await pdfParse(buffer);
  const extractedText = parsedPdf.text.trim().slice(0, MAX_STORED_TEXT_LENGTH);

  if (!extractedText) {
    throw new Error("No extractable text found in this PDF (it may be a scanned image)");
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: "ANALYZING", extractedText },
  });

  console.log(
    `[resume.worker] Resume ${resumeId} — extracted ${parsedPdf.text.length} characters from ${parsedPdf.numpages} page(s), starting AI analysis`
  );

  // --- Stage 2: AI parsing + deterministic scoring (Phase 6) ---
  const parsed = await parseResumeText(extractedText);
  const score = calculateResumeScore(parsed);
  const insights = deriveInsights(parsed, score);

  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      status: "COMPLETED",
      skills: parsed.skills,
      education: parsed.education,
      experience: parsed.experience,
      projects: parsed.projects,
      certifications: parsed.certifications,
      resumeScore: score.overall,
      scoreBreakdown: score.breakdown,
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
      recommendations: insights.recommendations,
      failureReason: null,
      processedAt: new Date(),
      aiProcessedAt: new Date(),
    },
  });

  console.log(`[resume.worker] Resume ${resumeId} fully analyzed — score ${score.overall}/100`);

  await createNotification(resume.userId, {
    type: "RESUME_PROCESSED",
    title: "Resume analysis complete",
    message: `Your resume scored ${score.overall}/100. View the full breakdown on your Resume Intelligence page.`,
  });
}

const worker = new Worker("resume-processing", processResumeJob, {
  connection: redisConnection,
  concurrency: 2,
});

worker.on("completed", (job) => {
  console.log(`[resume.worker] Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  console.error(`[resume.worker] Job ${job?.id} failed:`, err.message);
  if (job?.data?.resumeId) {
    const resume = await prisma.resume
      .update({
        where: { id: job.data.resumeId },
        data: { status: "FAILED", failureReason: err.message.slice(0, 500) },
      })
      .catch((updateErr) => {
        console.error("[resume.worker] Could not record failure on resume row:", updateErr.message);
        return null;
      });

    if (resume) {
      await createNotification(resume.userId, {
        type: "RESUME_PROCESSED",
        title: "Resume analysis failed",
        message: "We couldn't fully analyze your resume. Please try uploading it again.",
      }).catch(() => {});
    }
  }
});

console.log("HireMind AI resume worker started — waiting for jobs on 'resume-processing'...");
