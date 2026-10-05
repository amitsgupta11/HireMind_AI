"use client";

import { motion } from "framer-motion";
import {
  UploadCloud,
  BrainCircuit,
  Target,
  ClipboardCheck,
  MessagesSquare,
  Gauge,
  UserCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";

const STEPS = [
  { icon: UploadCloud, title: "Upload Resume", desc: "Candidates upload a PDF resume in seconds." },
  { icon: BrainCircuit, title: "AI Understands Candidate", desc: "Skills, education and experience are extracted." },
  { icon: Target, title: "Match With Jobs", desc: "Deterministic scoring compares candidate to role." },
  { icon: ClipboardCheck, title: "Assess Skills", desc: "Recruiter-defined assessments validate ability." },
  { icon: MessagesSquare, title: "AI Interview", desc: "Dynamic questions probe real understanding." },
  { icon: Gauge, title: "Candidate Intelligence", desc: "Every signal combines into one explainable score." },
  { icon: UserCheck, title: "Recruiter Decision", desc: "The final call always stays with a human." },
];

// This IS a real sequence — the order carries meaning (each stage feeds
// the next), so numbering the steps is earned here rather than decorative.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow="How it works"
          title="From resume to recruiter decision"
          desc="Seven stages turn raw candidate data into intelligence a recruiter can act on."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            >
              <Card className="h-full">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-current/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-current/60">{step.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, desc, center = true }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-signal-violet">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-4 text-current/60">{desc}</p>}
    </div>
  );
}
