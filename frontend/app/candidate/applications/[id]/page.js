"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ClipboardCheck, MessagesSquare } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import StatusTimeline from "@/components/applications/StatusTimeline";
import CandidateIntelligenceCard from "@/components/intelligence/CandidateIntelligenceCard";
import { useAuth } from "@/context/AuthContext";
import { applicationApi } from "@/lib/api";

export default function ApplicationDetailPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <ApplicationDetailBody />
    </ProtectedRoute>
  );
}

function ApplicationDetailBody() {
  const { id } = useParams();
  const { token } = useAuth();
  const [application, setApplication] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    applicationApi
      .getById(id, token)
      .then((res) => setApplication(res.data.application))
      .catch((err) => setError(err.message));
  }, [id, token]);

  if (!application) {
    return (
      <DashboardShell items={candidateNav} title="Application">
        {error ? (
          <Card><p className="text-sm text-signal-rose">{error}</p></Card>
        ) : (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
          </div>
        )}
      </DashboardShell>
    );
  }

  const hasAssessment = Boolean(application.job.assessment) || application.assessmentAttempt;

  return (
    <DashboardShell items={candidateNav} title="Application">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">{application.job.title}</h2>
              <p className="text-sm text-current/60">{application.job.company?.name}</p>
            </div>
            <ApplicationStatusBadge status={application.status} />
          </div>
          <div className="mt-6">
            <StatusTimeline status={application.status} />
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                <ClipboardCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">Assessment</p>
                <p className="text-xs text-current/50">
                  {application.assessmentAttempt
                    ? application.assessmentAttempt.status === "SUBMITTED"
                      ? `Submitted — ${application.assessmentAttempt.score ?? "—"}/100`
                      : "In progress"
                    : hasAssessment
                    ? "Not started"
                    : "No assessment for this job"}
                </p>
              </div>
            </div>
            {hasAssessment && application.job.assessment && (
              <Button
                as={Link}
                href={`/candidate/assessments/${application.job.assessment.id}`}
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                {application.assessmentAttempt?.status === "SUBMITTED" ? "View Assessment" : "Take Assessment"}
              </Button>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                <MessagesSquare className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">AI Interview</p>
                <p className="text-xs text-current/50">
                  {application.interview
                    ? application.interview.status === "COMPLETED"
                      ? `Completed — ${application.interview.overallScore ?? "—"}/100`
                      : "In progress"
                    : "Not started"}
                </p>
              </div>
            </div>
            <Button as={Link} href={`/candidate/interview/${application.id}`} variant="outline" size="sm" className="mt-4 w-full">
              {application.interview ? "Continue / View" : "Start AI Interview"}
            </Button>
          </Card>
        </div>

        <CandidateIntelligenceCard applicationId={application.id} />
      </div>
    </DashboardShell>
  );
}
