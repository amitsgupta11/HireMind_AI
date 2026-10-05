const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const { jwtSecret, jwtExpiresIn, frontendUrl } = require("../config/env");
const ApiError = require("../utils/ApiError");
const { sendPasswordResetEmail } = require("./email.service");

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

async function register({ email, password, role, fullName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
      ...(role === "CANDIDATE"
        ? { candidateProfile: { create: { fullName } } }
        : { recruiterProfile: { create: { fullName } } }),
    },
    include: { candidateProfile: true, recruiterProfile: true },
  });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { candidateProfile: true, recruiterProfile: true },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (user.status === "SUSPENDED") {
    throw ApiError.forbidden("This account has been suspended", "ACCOUNT_SUSPENDED");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

async function getById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { candidateProfile: true, recruiterProfile: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  return sanitizeUser(user);
}

// Always resolves with the same generic response whether or not the email
// exists, so this endpoint can never be used to enumerate registered users.
async function requestPasswordReset(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashToken(rawToken);
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetTokenHash, resetTokenExpiry },
    });

    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return { message: "If that email is registered, a reset link has been sent." };
}

async function resetPassword({ email, token, newPassword }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.resetTokenHash || !user.resetTokenExpiry) {
    throw ApiError.badRequest("This reset link is invalid or has expired", "RESET_TOKEN_INVALID");
  }

  if (user.resetTokenExpiry < new Date()) {
    throw ApiError.badRequest("This reset link has expired", "RESET_TOKEN_EXPIRED");
  }

  const providedHash = hashToken(token);
  if (providedHash !== user.resetTokenHash) {
    throw ApiError.badRequest("This reset link is invalid or has expired", "RESET_TOKEN_INVALID");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetTokenHash: null, resetTokenExpiry: null },
  });

  return { message: "Password updated successfully. You can now sign in." };
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw ApiError.notFound("User not found", "USER_NOT_FOUND");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw ApiError.badRequest("Current password is incorrect", "INVALID_CURRENT_PASSWORD");
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: "Password updated successfully" };
}




module.exports = { register, login, getById, requestPasswordReset, changePassword, resetPassword };
