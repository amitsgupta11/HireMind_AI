"use client";

import { CheckCircle2, AlertTriangle, Lightbulb, GraduationCap, Briefcase, FolderGit2, Award } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";

// The Resume Intelligence report — the AI (resumeParser.js) only ever
// supplied the raw facts (skills, education, experience...); every score
// shown here was computed deterministically from those facts on the
// backend (resumeScoring.service.js). Skills are shown as extracted
// chips, not fabricated per-skill percentages we have no real data for.
export default function ResumeIntelligenceReport({ resume }) {
  if (resume.status !== "COMPLETED" || resume.resumeScore == null) return null;

  const breakdown = resume.scoreBreakdown || {};

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <ScoreRing score={resume.resumeScore} size={120} strokeWidth={10} label="Resume Score" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniScore label="Skills" value={breakdown.skills} />
            <MiniScore label="Experience" value={breakdown.experience} />
            <MiniScore label="Education" value={breakdown.education} />
            <MiniScore label="Projects & Certs" value={breakdown.projectsAndCerts} />
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle icon={Award} title="Skills" />
        <div className="mt-3 flex flex-wrap gap-2">
          {(resume.skills || []).length > 0 ? (
            resume.skills.map((s) => (
              <Badge key={s} tone="violet">
                {s}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-current/40">No skills detected in this resume.</p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <SectionTitle icon={GraduationCap} title="Education" />
          <div className="mt-3 space-y-3">
            {(resume.education || []).length > 0 ? (
              resume.education.map((e, i) => (
                <div key={i}>
                  <p className="text-sm font-medium">{e.degree || "Degree"}</p>
                  <p className="text-xs text-current/50">
                    {e.institution} {e.year && `· ${e.year}`}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-current/40">No education history detected.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Briefcase} title="Experience" />
          <div className="mt-3 space-y-3">
            {(resume.experience || []).length > 0 ? (
              resume.experience.map((e, i) => (
                <div key={i}>
                  <p className="text-sm font-medium">{e.title || "Role"}</p>
                  <p className="text-xs text-current/50">
                    {e.company} {e.durationYears ? `· ${e.durationYears} yr` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-current/40">No work experience detected.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <SectionTitle icon={FolderGit2} title="Projects" />
          <div className="mt-3 space-y-3">
            {(resume.projects || []).length > 0 ? (
              resume.projects.map((p, i) => (
                <div key={i}>
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && <p className="text-xs text-current/50">{p.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-current/40">No projects detected.</p>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Award} title="Certifications" />
          <div className="mt-3 flex flex-wrap gap-2">
            {(resume.certifications || []).length > 0 ? (
              resume.certifications.map((c) => (
                <Badge key={c} tone="cyan">
                  {c}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-current/40">No certifications detected.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <InsightList
          icon={CheckCircle2}
          iconTone="text-signal-mint"
          title="Strengths"
          items={resume.strengths}
        />
        <InsightList
          icon={AlertTriangle}
          iconTone="text-signal-amber"
          title="Weaknesses"
          items={resume.weaknesses}
        />
        <InsightList
          icon={Lightbulb}
          iconTone="text-signal-violet"
          title="Recommendations"
          items={resume.recommendations}
        />
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-signal-violet" />
      <h3 className="font-display text-sm font-semibold">{title}</h3>
    </div>
  );
}

function MiniScore({ label, value }) {
  return (
    <div className="rounded-xl bg-paper-softer p-3 text-center dark:bg-ink-softer">
      <p className="font-display text-lg font-semibold">{value ?? "—"}</p>
      <p className="text-[11px] text-current/50">{label}</p>
    </div>
  );
}

function InsightList({ icon: Icon, iconTone, title, items }) {
  return (
    <Card>
      <SectionTitle icon={Icon} title={title} />
      <ul className="mt-3 space-y-2">
        {(items || []).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-current/70">
            <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconTone}`} />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
