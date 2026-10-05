"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import { SectionHeading } from "./HowItWorks";

const CRITERIA = [
  { label: "Technical Accuracy", value: 88 },
  { label: "Communication", value: 91 },
  { label: "Problem Solving", value: 86 },
  { label: "Confidence", value: 92 },
];

export default function AIInterviewSection() {
  return (
    <section className="py-28">
      <div className="container-shell grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="AI Interview"
            title="Interviews that evaluate substance"
            desc="Questions are generated from the job and resume, and every answer is scored against measurable criteria — never a single opaque number."
            center={false}
          />
        </div>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-current/50">
            Question 3 of 6
          </p>
          <p className="mt-2 font-medium">
            "Walk me through how you'd design a job-matching service that
            needs to stay accurate as skill data changes over time."
          </p>

          <div className="mt-5 rounded-xl bg-paper-softer p-4 text-sm text-current/70 dark:bg-ink-softer">
            Candidate answer transcript appears here in real time as they respond.
          </div>

          <div className="mt-6 space-y-3">
            {CRITERIA.map((c, i) => (
              <div key={c.label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-current/60">{c.label}</span>
                  <span className="font-mono font-medium">{c.value}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-softer dark:bg-ink-softer">
                  <motion.div
                    className="h-full rounded-full bg-signal-gradient"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
