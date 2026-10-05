// Notification email abstraction.
//
// This is a REAL interface, not a fake AI response: in production it would
// call a provider (SES, Postmark, Resend, etc.) using credentials from env.
// No provider is configured yet, so the "send" is explicitly logged as a
// DEV FALLBACK — it is never presented to the user as a delivered email.
const { nodeEnv } = require("../config/env");

async function sendEmail({ to, subject, text }) {
  const providerConfigured = Boolean(process.env.EMAIL_PROVIDER_API_KEY);

  if (!providerConfigured) {
    console.log(
      `[email.service][DEV FALLBACK — no provider configured] ` +
        `Would send to="${to}" subject="${subject}"\n${text}`
    );
    return { delivered: false, devFallback: true };
  }

  // Real provider integration point — implemented when EMAIL_PROVIDER_API_KEY
  // and a chosen provider SDK are added to the project (not part of Phase 2).
  throw new Error("Email provider integration not yet implemented");
}

async function sendPasswordResetEmail(to, resetUrl) {
  return sendEmail({
    to,
    subject: "Reset your HireMind AI password",
    text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
  });
}

module.exports = { sendEmail, sendPasswordResetEmail };
