// Verifies duplicate-application prevention WITHOUT needing a real
// database: the Postgres unique constraint on (jobId, userId) is what
// actually enforces this, and Prisma surfaces a violation as error code
// P2002 — this test confirms applyToJob() translates that into a clean
// 409 ALREADY_APPLIED instead of a raw database error leaking out.
jest.mock("../src/config/prisma", () => ({
  job: { findUnique: jest.fn() },
  resume: { findFirst: jest.fn() },
  application: { create: jest.fn() },
}));
jest.mock("../src/services/notification.service", () => ({
  createNotification: jest.fn(),
}));

const prisma = require("../src/config/prisma");
const { applyToJob } = require("../src/services/application.service");

describe("applyToJob — duplicate prevention", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.job.findUnique.mockResolvedValue({ id: "job1", isPublished: true, assessment: null, title: "Engineer" });
    prisma.resume.findFirst.mockResolvedValue({ id: "resume1" });
  });

  it("throws a 409 ALREADY_APPLIED when Prisma reports a unique constraint violation", async () => {
    prisma.application.create.mockRejectedValue({ code: "P2002" });

    await expect(applyToJob("user1", "job1")).rejects.toMatchObject({
      statusCode: 409,
      errorCode: "ALREADY_APPLIED",
    });
  });

  it("succeeds normally when no duplicate exists", async () => {
    prisma.application.create.mockResolvedValue({ id: "app1", status: "APPLIED" });

    const result = await applyToJob("user1", "job1");
    expect(result.id).toBe("app1");
  });

  it("rejects applying to an unpublished job before ever touching the database write", async () => {
    prisma.job.findUnique.mockResolvedValue({ id: "job1", isPublished: false });

    await expect(applyToJob("user1", "job1")).rejects.toMatchObject({ errorCode: "JOB_NOT_AVAILABLE" });
    expect(prisma.application.create).not.toHaveBeenCalled();
  });

  it("requires a resume to exist before applying", async () => {
    prisma.resume.findFirst.mockResolvedValue(null);

    await expect(applyToJob("user1", "job1")).rejects.toMatchObject({ errorCode: "RESUME_REQUIRED" });
  });
});
