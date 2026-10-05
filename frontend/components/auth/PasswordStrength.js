"use client";

import { cn } from "@/lib/utils";

// Scores 0–4 based on the same rules the backend enforces (length,
// uppercase, number) plus length bonuses, so the meter never promises
// something the server would reject.
function scorePassword(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const LEVELS = [
  { label: "Too weak", color: "bg-signal-rose" },
  { label: "Weak", color: "bg-signal-rose" },
  { label: "Fair", color: "bg-signal-amber" },
  { label: "Good", color: "bg-signal-mint" },
  { label: "Strong", color: "bg-signal-mint" },
];

export default function PasswordStrength({ password }) {
  const score = scorePassword(password);
  const level = LEVELS[score];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full bg-paper-softer dark:bg-ink-softer",
              i < score && level.color
            )}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-current/50">{level.label}</p>
    </div>
  );
}
