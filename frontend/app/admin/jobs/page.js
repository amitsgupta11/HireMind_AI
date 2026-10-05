"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/adminNav";
import Card from "@/components/ui/Card";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";

export default function AdminJobsPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <AdminJobsBody />
    </ProtectedRoute>
  );
}

function AdminJobsBody() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    if (!token) return;
    adminApi.listJobs(token).then((res) => setJobs(res.data.jobs));
  }, [token]);

  return (
    <DashboardShell items={adminNav} title="Jobs">
      {jobs === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {jobs?.length === 0 && <Card className="py-16 text-center text-sm text-current/50">No jobs on the platform yet.</Card>}
      {jobs && jobs.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{j.title}</p>
                <p className="text-xs text-current/50">
                  {j.company?.name} · {j._count.applications} applicant(s)
                </p>
              </div>
              <JobStatusBadge isPublished={j.isPublished} />
            </div>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
