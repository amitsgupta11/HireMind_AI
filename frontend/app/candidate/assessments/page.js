"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ClipboardCheck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { applicationApi } from "@/lib/api";

export default function AssessmentsListPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <AssessmentsListBody />
    </ProtectedRoute>
  );
}

function AssessmentsListBody() {
  const { token } = useAuth();
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    if (!token) return;
    applicationApi.listMine(token).then((res) => setApplications(res.data.applications));
  }, [token]);

  const withAssessment = applications?.filter((a) => a.job.assessment) || [];

  return (
    <DashboardShell items={candidateNav} title="Assessments">
      {applications === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {applications && withAssessment.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
            <ClipboardCheck className="h-6 w-6" />
          </span>
          <p className="font-medium">No assessments yet</p>
          <p className="max-w-sm text-sm text-current/60">
            Jobs with a screening assessment will show up here once you apply.
          </p>
        </Card>
      )}
      {withAssessment.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {withAssessment.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{app.job.assessment.title}</p>
                <p className="text-xs text-current/50">
                  {app.job.title} · {app.job.assessment.durationMinutes} min
                </p>
              </div>
              <Button as={Link} href={`/candidate/assessments/${app.job.assessment.id}`} variant="outline" size="sm">
                {app.assessmentAttempt?.status === "SUBMITTED" ? "View Result" : "Take Assessment"}
              </Button>
            </div>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
