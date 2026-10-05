"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Mail, MapPin } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import CandidateIntelligenceCard from "@/components/intelligence/CandidateIntelligenceCard";
import ResumeIntelligenceReport from "@/components/candidate/ResumeIntelligenceReport";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { applicationApi } from "@/lib/api";

// This is one of the most important screens in the product — everything
// a recruiter needs about one candidate, in one place: resume
// intelligence, match, assessment performance (question-wise), AI
// interview transcript, and the combined Candidate Intelligence score.
export default function RecruiterApplicationDetailPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <DetailBody />
    </ProtectedRoute>
  );
}

function DetailBody() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [application, setApplication] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    applicationApi
      .getById(id, token)
      .then((res) => setApplication(res.data.application))
      .catch((err) => setError(err.message));
    applicationApi
      .getResume(id, token)
      .then((res) => setResume(res.data.resume))
      .catch(() => setResume(null));
  }, [id, token]);

  useEffect(load, [load]);

  const act = async (action) => {
    setBusy(true);
    try {
      if (action === "shortlist") await applicationApi.shortlist(id, token);
      else await applicationApi.reject(id, token);
      showToast(action === "shortlist" ? "Candidate shortlisted." : "Candidate rejected.");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <DashboardShell items={recruiterNav} title="Candidate">
        <Card><p className="text-sm text-signal-rose">{error}</p></Card>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell items={recruiterNav} title="Candidate">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell items={recruiterNav} title="Candidate">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold">
                {application.user?.candidateProfile?.fullName || "Candidate"}
              </h2>
              <p className="mt-1 text-sm text-current/60">
                Applied for <span className="font-medium">{application.job.title}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-current/50">
                {application.user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {application.user.email}
                  </span>
                )}
                {application.user?.candidateProfile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {application.user.candidateProfile.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ApplicationStatusBadge status={application.status} />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-line-light pt-4 dark:border-line-dark">
            <Button
              size="sm"
              variant="outline"
              className="text-signal-mint hover:bg-signal-mint/10"
              loading={busy}
              disabled={application.status === "SHORTLISTED"}
              onClick={() => act("shortlist")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Shortlist
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-signal-rose hover:bg-signal-rose/10"
              loading={busy}
              disabled={application.status === "REJECTED"}
              onClick={() => act("reject")}
            >
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </Card>

        <CandidateIntelligenceCard applicationId={application.id} />

        {resume && (
          <div>
            <h3 className="mb-3 font-display text-base font-semibold">Resume Intelligence</h3>
            <ResumeIntelligenceReport resume={resume} />
          </div>
        )}

        {application.assessmentAttempt && (
          <Card>
            <h3 className="mb-3 font-display text-base font-semibold">Assessment Performance</h3>
            <div className="mb-4 flex items-center gap-3">
              <Badge tone={application.assessmentAttempt.status === "SUBMITTED" ? "mint" : "amber"}>
                {application.assessmentAttempt.status}
              </Badge>
              {application.assessmentAttempt.score != null && (
                <span className="font-display text-lg font-semibold text-signal-violet">
                  {application.assessmentAttempt.score}/100
                </span>
              )}
            </div>
            {application.assessmentAttempt.answers?.length > 0 && (
              <div className="space-y-2">
                {application.assessmentAttempt.answers.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl bg-paper-softer px-4 py-2.5 text-sm dark:bg-ink-softer"
                  >
                    <span>Question {i + 1}</span>
                    {a.isCorrect != null ? (
                      a.isCorrect ? (
                        <Badge tone="mint">Correct</Badge>
                      ) : (
                        <Badge tone="rose">Incorrect</Badge>
                      )
                    ) : (
                      <Badge tone="violet">Subjective</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {application.interview && (
          <Card>
            <h3 className="mb-3 font-display text-base font-semibold">AI Interview Report</h3>
            {application.interview.status === "COMPLETED" ? (
              <>
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl bg-signal-gradient p-3 text-center text-white">
                    <p className="font-display text-lg font-semibold">{application.interview.overallScore}</p>
                    <p className="text-[10px] text-white/70">Overall</p>
                  </div>
                  {Object.entries(application.interview.scoreBreakdown || {}).map(([key, value]) => (
                    <div key={key} className="rounded-xl bg-paper-softer p-3 text-center dark:bg-ink-softer">
                      <p className="font-display text-lg font-semibold">{value}</p>
                      <p className="text-[10px] capitalize text-current/50">{key.replace(/([A-Z])/g, " $1")}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-current/70">{application.interview.summary}</p>
              </>
            ) : (
              <Badge tone="amber">In progress</Badge>
            )}
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
