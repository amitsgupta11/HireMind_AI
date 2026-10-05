"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

// Job picker — pick which job's applicants to review. Applicant
// comparisons, scores, and shortlist/reject actions live on the
// per-job page this links into.
export default function ApplicantsIndexPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <ApplicantsIndexBody />
    </ProtectedRoute>
  );
}

function ApplicantsIndexBody() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    if (!token) return;
    jobsApi.listMine(token).then((res) => setJobs(res.data.jobs));
  }, [token]);

  return (
    <DashboardShell items={recruiterNav} title="Applicants">
      {jobs === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {jobs?.length === 0 && (
        <Card className="py-16 text-center text-sm text-current/50">
          Create a job first to start receiving applicants.
        </Card>
      )}
      {jobs && jobs.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/recruiter/jobs/${job.id}/applicants`}
              className="flex items-center justify-between px-6 py-4 hover:bg-paper-softer/60 dark:hover:bg-ink-softer/60"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-current/50">{job._count?.applications ?? 0} applicant(s)</p>
                </div>
              </div>
              <JobStatusBadge isPublished={job.isPublished} />
            </Link>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
