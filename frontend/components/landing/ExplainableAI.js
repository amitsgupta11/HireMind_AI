"use client";

import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SectionHeading } from "./HowItWorks";

const MATCHED = ["JavaScript", "React", "Node.js", "SQL"];
const MISSING = ["Docker", "Kubernetes"];

export default function ExplainableAI() {
  const [open, setOpen] = useState(true);

  return (
    <section className="py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Explainable AI"
          title="Every score comes with a reason"
          desc="Recruiters and candidates both see exactly why a match landed where it did."
        />

        <Card className="mx-auto mt-16 max-w-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-current/60">Match Score</span>
            <span className="font-display text-2xl font-semibold text-signal-violet">86%</span>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-current/50">
                Matched skills
              </p>
              <div className="flex flex-wrap gap-2">
                {MATCHED.map((s) => (
                  <Badge key={s} tone="mint">
                    <Check className="h-3 w-3" /> {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-current/50">
                Missing skills
              </p>
              <div className="flex flex-wrap gap-2">
                {MISSING.map((s) => (
                  <Badge key={s} tone="rose">
                    <X className="h-3 w-3" /> {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line-light pt-6 dark:border-line-dark">
            <Stat label="Experience Match" value="92%" />
            <Stat label="Education Match" value="100%" />
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-paper-softer px-4 py-3 text-left text-sm font-medium dark:bg-ink-softer"
          >
            Why this score?
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <p className="mt-3 px-1 text-sm leading-relaxed text-current/65">
              Your strongest match comes from JavaScript, React and Node.js.
              Adding Docker and Kubernetes experience could improve your compatibility.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-current/50">{label}</p>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
