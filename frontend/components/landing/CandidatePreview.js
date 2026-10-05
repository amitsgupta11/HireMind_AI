"use client";

import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { SectionHeading } from "./HowItWorks";

const SKILLS = [
  { name: "JavaScript", value: 92 },
  { name: "React", value: 85 },
  { name: "Node.js", value: 78 },
  { name: "SQL", value: 70 },
  { name: "Docker", value: 40 },
];

export default function CandidatePreview() {
  return (
    <section id="candidates" className="py-28">
      <div className="container-shell grid gap-14 lg:grid-cols-2 lg:items-center">
        <Card className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-current/50">
            Skill heatmap
          </p>
          <div className="mt-4 space-y-3">
            {SKILLS.map((s, i) => (
              <div key={s.name}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span>{s.name}</span>
                  <span className="font-mono text-current/50">{s.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-paper-softer dark:bg-ink-softer">
                  <motion.div
                    className="h-full rounded-full bg-signal-gradient"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 border-t border-line-light pt-6 dark:border-line-dark">
            <ScoreRing score={88} size={72} strokeWidth={6} colorClassName="stroke-signal-violet" />
            <div>
              <p className="text-sm font-medium">Resume Score</p>
              <p className="text-xs text-current/50">
                Based on skills, experience depth, and project relevance.
              </p>
            </div>
          </div>
        </Card>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="For candidates"
            title="See exactly how you're evaluated"
            desc="Your resume score, skill heatmap and job match are visible to you, not hidden inside a recruiter's inbox."
            center={false}
          />
        </div>
      </div>
    </section>
  );
}
