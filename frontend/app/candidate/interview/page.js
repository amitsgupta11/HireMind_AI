"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessagesSquare } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { applicationApi } from "@/lib/api";

export default function InterviewListPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <InterviewListBody />
    </ProtectedRoute>
  );
}

function InterviewListBody() {
  const { token } = useAuth();
  const [applications, setApplications] = useState(null);

  useEffect(() => {
    if (!token) return;
    applicationApi.listMine(token).then((res) => setApplications(res.data.applications));
  }, [token]);

  return (
    <DashboardShell items={candidateNav} title="AI Interview">
      {applications === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {applications?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
            <MessagesSquare className="h-6 w-6" />
          </span>
          <p className="font-medium">Apply to a job first</p>
          <Link href="/candidate/jobs" className="text-sm font-medium text-signal-violet hover:underline">
            Browse jobs →
          </Link>
        </Card>
      )}
      {applications && applications.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{app.job.title}</p>
                <p className="text-xs text-current/50">
                  {app.interview
                    ? app.interview.status === "COMPLETED"
                      ? `Completed — ${app.interview.overallScore ?? "—"}/100`
                      : "In progress"
                    : "Not started"}
                </p>
              </div>
              <Button as={Link} href={`/candidate/interview/${app.id}`} variant="outline" size="sm">
                {app.interview ? (app.interview.status === "COMPLETED" ? "View Report" : "Continue") : "Start Interview"}
              </Button>
            </div>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
