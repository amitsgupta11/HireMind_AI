"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

// Tag-style skill input — type a skill, press Enter or comma to add it as
// a chip. Used for both Required and Preferred skill steps in the wizard.
export default function SkillInput({ value = [], onChange, placeholder, tone = "violet" }) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  };

  const removeSkill = (skill) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    } else if (e.key === "Backspace" && !draft && value.length) {
      removeSkill(value[value.length - 1]);
    }
  };

  const chipTone =
    tone === "violet"
      ? "bg-signal-violet/10 text-signal-violet border-signal-violet/20"
      : "bg-signal-cyan/10 text-[#0E7490] dark:text-signal-cyan border-signal-cyan/20";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line-light bg-paper-soft p-3 dark:border-line-dark dark:bg-ink-softer">
        {value.map((skill) => (
          <span
            key={skill}
            className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", chipTone)}
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
              className="rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addSkill}
          placeholder={placeholder || "Type a skill and press Enter"}
          className="min-w-[140px] flex-1 bg-transparent text-sm outline-none placeholder:text-current/35"
        />
      </div>
      <button
        type="button"
        onClick={addSkill}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-signal-violet hover:underline"
      >
        <Plus className="h-3 w-3" /> Add skill
      </button>
    </div>
  );
}
