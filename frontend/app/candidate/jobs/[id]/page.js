"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, Briefcase, Check, X, ChevronDown } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { jobsApi } from "@/lib/api";

export default function JobDetailPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <JobDetailBody />
    </ProtectedRoute>
  );
}

function JobDetailBody() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [matchError, setMatchError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applied, setApplied] = useState(false);
  const [showWhy, setShowWhy] = useState(true);

  useEffect(() => {
    jobsApi.getById(id).then((res) => setJob(res.data.job));
    jobsApi
      .getMatch(id, token)
      .then((res) => setMatch(res.data.match))
      .catch((err) => setMatchError(err.message));
  }, [id, token]);

  const onApply = async () => {
    setApplying(true);
    setApplyError("");
    try {
      await jobsApi.apply(id, token);
      setApplied(true);
      showToast("Application submitted!");
    } catch (err) {
      if (err.errorCode === "ALREADY_APPLIED") {
        setApplied(true);
      } else {
        setApplyError(err.message);
      }
    } finally {
      setApplying(false);
    }
  };

  if (!job) {
    return (
      <DashboardShell items={candidateNav} title="Job Details">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell items={candidateNav} title="Job Details">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">{job.title}</h2>
              <p className="mt-1 text-sm text-current/60">{job.company?.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-current/50">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {job.location}
                </span>
                {job.employmentType && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {job.employmentType}
                  </span>
                )}
              </div>
            </div>
            {match && (
              <div className="flex flex-col items-center rounded-2xl bg-signal-gradient px-5 py-3 text-white">
                <span className="text-2xl font-bold">{match.overall}%</span>
                <span className="text-[10px] uppercase tracking-wide text-white/70">Match</span>
              </div>
            )}
          </div>

          <p className="mt-6 whitespace-pre-line text-sm text-current/70">{job.description}</p>

          {(job.salaryMin || job.salaryMax) && (
            <p className="mt-4 text-sm text-current/60">
              Salary: ₹{job.salaryMin || 0} – ₹{job.salaryMax || "—"} / yr
            </p>
          )}
          <p className="text-sm text-current/60">
            Experience: {job.experienceMin || 0}
            {job.experienceMax ? `–${job.experienceMax}` : "+"} years
          </p>

          <div className="mt-6 border-t border-line-light pt-4 dark:border-line-dark">
            {applyError && <p className="mb-3 text-sm text-signal-rose">{applyError}</p>}
            {applied ? (
              <Badge tone="mint">Applied</Badge>
            ) : (
              <Button onClick={onApply} loading={applying}>
                Apply Now
              </Button>
            )}
          </div>
        </Card>

        {matchError && (
          <Card>
            <p className="text-sm text-current/60">
              {matchError.toLowerCase().includes("resume") ? (
                <>
                  Complete your resume analysis to see your match score for this job.{" "}
                  <Link href="/candidate/resume" className="font-medium text-signal-violet hover:underline">
                    Go to Resume Intelligence →
                  </Link>
                </>
              ) : (
                matchError
              )}
            </p>
          </Card>
        )}

        {match && (
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Match Breakdown</h3>
              <span className="font-display text-xl font-semibold text-signal-violet">{match.overall}%</span>
            </div>

            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-current/50">Matched skills</p>
                <div className="flex flex-wrap gap-2">
                  {match.matchedSkills.length > 0 ? (
                    match.matchedSkills.map((s) => (
                      <Badge key={s} tone="mint">
                        <Check className="h-3 w-3" /> {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-current/40">None</span>
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-current/50">Missing skills</p>
                <div className="flex flex-wrap gap-2">
                  {match.missingSkills.length > 0 ? (
                    match.missingSkills.map((s) => (
                      <Badge key={s} tone="rose">
                        <X className="h-3 w-3" /> {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-current/40">None</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line-light pt-4 dark:border-line-dark">
              <MiniStat label="Required Skills" value={match.breakdown.requiredSkills} />
              <MiniStat label="Preferred Skills" value={match.breakdown.preferredSkills} />
              <MiniStat label="Experience" value={match.breakdown.experience} />
            </div>

            <button
              onClick={() => setShowWhy((s) => !s)}
              className="mt-6 flex w-full items-center justify-between rounded-xl bg-paper-softer px-4 py-3 text-left text-sm font-medium dark:bg-ink-softer"
            >
              Why this score?
              <ChevronDown className={`h-4 w-4 transition-transform ${showWhy ? "rotate-180" : ""}`} />
            </button>
            {showWhy && (
              <p className="mt-3 px-1 text-sm leading-relaxed text-current/65">
                70% of your match comes from required skills, 15% from preferred skills, and 15%
                from how your experience compares to what this role expects.
                {match.missingSkills.length > 0 &&
                  ` Adding ${match.missingSkills.slice(0, 2).join(" and ")} to your resume could improve this score.`}
              </p>
            )}
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg font-semibold">{value}%</p>
      <p className="text-xs text-current/50">{label}</p>
    </div>
  );
}
