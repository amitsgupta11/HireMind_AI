// DEMO DATA — for local development only. Never run against production.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  const company = await prisma.company.create({
    data: { name: "Demo Company Inc. (DEMO DATA)", website: "https://example.com" },
  });

  const recruiter = await prisma.user.create({
    data: {
      email: "recruiter@demo.hiremind.ai",
      passwordHash,
      role: "RECRUITER",
      recruiterProfile: {
        create: { fullName: "Demo Recruiter", title: "Talent Lead", companyId: company.id },
      },
    },
  });

  const candidate = await prisma.user.create({
    data: {
      email: "candidate@demo.hiremind.ai",
      passwordHash,
      role: "CANDIDATE",
      candidateProfile: { create: { fullName: "Demo Candidate" } },
    },
  });

  // A real admin account — admins are never self-registered through the
  // UI (there's no "Admin" option on /register), only created here or
  // directly in the database, matching the project's RBAC design.
  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.hiremind.ai",
      passwordHash,
      role: "ADMIN",
    },
  });

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: "Full-Stack Engineer (DEMO DATA)",
      description: "Demo job posting used only for local development.",
      location: "Remote",
      experienceMin: 2,
      experienceMax: 5,
      salaryMin: 800000,
      salaryMax: 1400000,
      isPublished: true,
      skills: {
        create: [
          { name: "JavaScript", level: "REQUIRED" },
          { name: "React", level: "REQUIRED" },
          { name: "Node.js", level: "REQUIRED" },
          { name: "Docker", level: "PREFERRED" },
        ],
      },
    },
  });

  // A demo screening assessment attached to the demo job — real MCQ +
  // subjective questions, so the assessment flow can be tried immediately.
  await prisma.assessment.create({
    data: {
      jobId: job.id,
      title: "Full-Stack Screening (DEMO DATA)",
      durationMinutes: 20,
      questions: {
        create: [
          {
            type: "MCQ",
            text: "Which HTTP method is idempotent?",
            options: ["POST", "GET", "PATCH", "CONNECT"],
            correctIndex: 1,
            order: 0,
          },
          {
            type: "MCQ",
            text: "What does React's useEffect run after by default?",
            options: ["Every render", "Only on mount", "Only on unmount", "Never"],
            correctIndex: 0,
            order: 1,
          },
          {
            type: "SUBJECTIVE",
            text: "Describe how you would design a rate limiter for a public API.",
            order: 2,
          },
        ],
      },
    },
  });

  // NOTE: no demo Resume, Application, Interview, or Candidate
  // Intelligence rows are seeded here on purpose — those all depend on
  // real uploads and real AI output (resume parsing, interview
  // evaluation). Seeding fabricated scores for them would be exactly the
  // "fake AI response" this project must never produce. Try the full
  // pipeline live: log in as the demo candidate, upload a real PDF
  // resume, apply to the demo job, take its assessment, and start the AI
  // interview.

  console.log("Seeded demo data:", {
    recruiter: recruiter.email,
    candidate: candidate.email,
    admin: admin.email,
    job: job.title,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
