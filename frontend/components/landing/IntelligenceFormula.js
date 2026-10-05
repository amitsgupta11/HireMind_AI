"use client";

import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { SectionHeading } from "./HowItWorks";

const INPUTS = [
  { label: "Resume Score", weight: "30%", score: 88, ring: "stroke-signal-violet" },
  { label: "Job Match", weight: "25%", score: 92, ring: "stroke-signal-cyan" },
  { label: "Assessment", weight: "25%", score: 84, ring: "stroke-signal-mint" },
  { label: "AI Interview", weight: "20%", score: 90, ring: "stroke-signal-amber" },
];

export default function IntelligenceFormula() {
  return (
    <section id="intelligence" className="py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Candidate Intelligence"
          title="Four signals. One explainable score."
          desc="Every input is weighted transparently — nothing about the final number is a black box."
        />

        <Card className="mt-16 overflow-hidden p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
            <div className="grid grid-cols-2 gap-6">
              {INPUTS.map((input) => (
                <div key={input.label} className="flex flex-col items-center gap-2">
                  <ScoreRing score={input.score} size={92} strokeWidth={7} colorClassName={input.ring} />
                  <p className="text-center text-sm font-medium">{input.label}</p>
                  <p className="font-mono text-xs text-current/50">{input.weight} weight</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center text-3xl font-light text-current/30 lg:rotate-0">
              =
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl bg-signal-gradient p-8 text-white">
              <p className="text-xs uppercase tracking-widest text-white/70">
                Candidate Intelligence
              </p>
              <ScoreRing score={90} size={140} strokeWidth={10} colorClassName="stroke-white" />
              <p className="text-center text-sm text-white/80">
                Weights are configured on the backend, never hardcoded in the UI.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
