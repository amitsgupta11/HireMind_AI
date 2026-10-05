"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { jobsApi, applicationApi } from "@/lib/api";

export default function JobApplicantsPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <JobApplicantsBody />
    </ProtectedRoute>
  );
}

function JobApplicantsBody() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [applicants, setApplicants] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    jobsApi
      .getApplicants(id, token)
      .then((res) => setApplicants(res.data.applications))
      .catch((err) => setError(err.message));
  }, [id, token]);

  useEffect(load, [load]);

  const act = async (applicationId, action) => {
    setBusyId(applicationId);
    try {
      if (action === "shortlist") await applicationApi.shortlist(applicationId, token);
      else await applicationApi.reject(applicationId, token);
      showToast(action === "shortlist" ? "Candidate shortlisted." : "Candidate rejected.");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell items={recruiterNav} title="Applicants">
      {applicants === null && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {error && <Card><p className="text-sm text-signal-rose">{error}</p></Card>}
      {applicants?.length === 0 && (
        <Card className="py-16 text-center text-sm text-current/50">No applicants yet for this job.</Card>
      )}
      {applicants && applicants.length > 0 && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-light text-left text-xs uppercase tracking-wide text-current/50 dark:border-line-dark">
                {["Candidate", "Resume", "Assessment", "Interview", "Candidate Intelligence", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-6 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => {
                const resume = app.user.resumes?.[0];
                return (
                  <tr key={app.id} className="border-b border-line-light last:border-0 hover:bg-paper-softer/60 dark:border-line-dark dark:hover:bg-ink-softer/60">
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link href={`/recruiter/applications/${app.id}`} className="font-medium hover:underline">
                        {app.user.candidateProfile?.fullName || app.user.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono">{resume?.resumeScore ?? "—"}</td>
                    <td className="px-6 py-4 font-mono">
                      {app.assessmentAttempt?.status === "SUBMITTED" ? app.assessmentAttempt.score ?? "—" : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {app.interview?.status === "COMPLETED" ? app.interview.overallScore ?? "—" : "—"}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-signal-violet">
                      {app.candidateIntelligence?.overallScore ?? "—"}
                    </td>
                    <td className="px-6 py-4"><ApplicationStatusBadge status={app.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-signal-mint hover:bg-signal-mint/10"
                          loading={busyId === app.id}
                          disabled={app.status === "SHORTLISTED"}
                          onClick={() => act(app.id, "shortlist")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-signal-rose hover:bg-signal-rose/10"
                          loading={busyId === app.id}
                          disabled={app.status === "REJECTED"}
                          onClick={() => act(app.id, "reject")}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardShell>
  );
}
