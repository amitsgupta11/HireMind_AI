"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Briefcase } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import ApplicationStatusBadge from "@/components/applications/ApplicationStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { applicationApi } from "@/lib/api";

export default function ApplicationsPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <ApplicationsBody />
    </ProtectedRoute>
  );
}

function ApplicationsBody() {
  const { token } = useAuth();
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    applicationApi
      .listMine(token)
      .then((res) => setApplications(res.data.applications))
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <DashboardShell items={candidateNav} title="Applications">
      {applications === null && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {error && <Card><p className="text-sm text-signal-rose">{error}</p></Card>}
      {applications?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="font-medium">No applications yet</p>
          <Link href="/candidate/jobs" className="text-sm font-medium text-signal-violet hover:underline">
            Browse jobs →
          </Link>
        </Card>
      )}
      {applications && applications.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {applications.map((app) => (
            <Link
              key={app.id}
              href={`/candidate/applications/${app.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-paper-softer/60 dark:hover:bg-ink-softer/60"
            >
              <div>
                <p className="font-medium">{app.job.title}</p>
                <p className="text-xs text-current/50">
                  {app.job.company?.name} · Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
              </div>
              <ApplicationStatusBadge status={app.status} />
            </Link>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
