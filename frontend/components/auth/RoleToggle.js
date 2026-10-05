"use client";

import { Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "CANDIDATE", label: "Candidate", desc: "Looking for a job", icon: User },
  { value: "RECRUITER", label: "Recruiter", desc: "Hiring talent", icon: Briefcase },
];

export default function RoleToggle({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I am a...">
      {ROLES.map((role) => {
        const active = value === role.value;
        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(role.value)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
              active
                ? "border-signal-violet bg-signal-gradient-soft"
                : "border-line-light hover:border-current/20 dark:border-line-dark"
            )}
          >
            <role.icon className={cn("h-5 w-5", active ? "text-signal-violet" : "text-current/50")} />
            <div>
              <p className="text-sm font-medium">{role.label}</p>
              <p className="text-xs text-current/50">{role.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
