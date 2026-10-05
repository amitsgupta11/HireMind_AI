const { registerSchema, loginSchema } = require("../src/validators/auth.validator");

describe("registerSchema", () => {
  it("accepts a valid candidate registration", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      role: "CANDIDATE",
      fullName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "password1",
      role: "CANDIDATE",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password",
      role: "CANDIDATE",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password1",
      role: "SUPERADMIN",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "Password1",
      role: "RECRUITER",
      fullName: "Test User",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires both email and password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});
