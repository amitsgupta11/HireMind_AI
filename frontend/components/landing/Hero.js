"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";

const PIPELINE = [
  { label: "Resume Analysis", value: "Parsed", tone: "text-signal-violet" },
  { label: "Job Match", value: "92%", tone: "text-signal-cyan" },
  { label: "Assessment", value: "87%", tone: "text-signal-mint" },
  { label: "AI Interview", value: "91%", tone: "text-signal-amber" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24">
      {/* Ambient signal glow — the one bold gesture on this page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-signal-gradient-soft blur-3xl"
      />

      <div className="container-shell relative grid items-center gap-16 lg:grid-cols-2">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-line-light px-3 py-1 text-xs font-medium text-current/70 dark:border-line-dark">
              <Sparkles className="h-3.5 w-3.5 text-signal-violet" />
              Candidate Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            Hire smarter.
            <br />
            Discover <span className="text-signal">better talent.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-current/65"
          >
            HireMind AI transforms resumes, assessments and interviews into
            explainable Candidate Intelligence that helps recruiters make
            better hiring decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Button as={Link} href="/register?role=recruiter" size="lg">
              Start Hiring <ArrowRight className="h-4 w-4" />
            </Button>
            <Button as={Link} href="#platform" variant="outline" size="lg">
              Explore Platform
            </Button>
          </motion.div>
        </div>

        {/* Animated product preview — deliberately not a static screenshot */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="relative">
            <div className="flex items-center justify-between border-b border-line-light pb-4 dark:border-line-dark">
              <span className="text-sm font-medium text-current/60">
                Candidate Intelligence — live preview
              </span>
              <span className="flex h-2 w-2 animate-pulse-soft rounded-full bg-signal-mint" />
            </div>

            <div className="mt-6 space-y-4">
              {PIPELINE.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
                  className="flex items-center justify-between rounded-xl bg-paper-softer/60 px-4 py-3 dark:bg-ink-softer/60"
                >
                  <span className="text-sm">{step.label}</span>
                  <span className={`font-mono text-sm font-semibold ${step.tone}`}>
                    {step.value}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-signal-gradient p-5 text-white">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Candidate Intelligence
                </p>
                <p className="font-display text-3xl font-semibold">90 / 100</p>
              </div>
              <ScoreRing score={90} size={64} strokeWidth={6} colorClassName="stroke-white" />
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
