"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Card from "@/components/ui/Card";
import ScoreRing from "@/components/ui/ScoreRing";
import { useAuth } from "@/context/AuthContext";
import { intelligenceApi } from "@/lib/api";

// The same visual language as the landing page's Candidate Intelligence
// section — but every number here is now real, computed via
// candidateIntelligence.service.js on the backend from whichever of
// Resume / Match / Assessment / Interview scores actually exist yet.
export default function CandidateIntelligenceCard({ applicationId }) {
  const { token } = useAuth();
  const [intelligence, setIntelligence] = useState(undefined);

  useEffect(() => {
    if (!applicationId || !token) return;
    intelligenceApi
      .getForApplication(applicationId, token)
      .then((res) => setIntelligence(res.data.intelligence))
      .catch(() => setIntelligence(null));
  }, [applicationId, token]);

  if (intelligence === undefined) {
    return (
      <Card className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-signal-violet" />
      </Card>
    );
  }

  if (!intelligence) return null;

  const parts = [
    { label: "Resume", value: intelligence.resumeScore, color: "stroke-signal-violet" },
    { label: "Job Match", value: intelligence.matchScore, color: "stroke-signal-cyan" },
    { label: "Assessment", value: intelligence.assessmentScore, color: "stroke-signal-mint" },
    { label: "Interview", value: intelligence.interviewScore, color: "stroke-signal-amber" },
  ];

  return (
    <Card>
      <h3 className="mb-4 font-display text-base font-semibold">Candidate Intelligence</h3>
      <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        {intelligence.overallScore != null ? (
          <ScoreRing score={intelligence.overallScore} size={120} strokeWidth={10} label="Overall" />
        ) : (
          <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border border-dashed border-line-light text-center text-xs text-current/40 dark:border-line-dark">
            Awaiting more data
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {parts.map((p) => (
            <div key={p.label} className="rounded-xl bg-paper-softer p-3 text-center dark:bg-ink-softer">
              <p className="font-display text-lg font-semibold">{p.value ?? "—"}</p>
              <p className="text-[11px] text-current/50">{p.label}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs text-current/40">
        Combines whichever signals are available so far — weighted 30% Resume, 25% Job Match, 25%
        Assessment, 20% Interview, rescaled if a step hasn't happened yet.
      </p>
    </Card>
  );
}
