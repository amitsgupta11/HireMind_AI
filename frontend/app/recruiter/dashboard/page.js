"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Building2, CheckCircle2, FileEdit, Plus } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { useAuth } from "@/context/AuthContext";
import { companyApi, jobsApi } from "@/lib/api";

export default function RecruiterDashboardPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <DashboardBody />
    </ProtectedRoute>
  );
}

function DashboardBody() {
  const { user, token } = useAuth();
  const [company, setCompany] = useState(undefined);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    if (!token) return;
    companyApi
      .getMine(token)
      .then((res) => setCompany(res.data.company))
      .catch(() => setCompany(null));
    jobsApi
      .listMine(token)
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setJobs([]));
  }, [token]);

  const publishedCount = jobs.filter((j) => j.isPublished).length;
  const draftCount = jobs.filter((j) => !j.isPublished).length;
  const firstName = user?.recruiterProfile?.fullName?.split(" ")[0] || "there";

  return (
    <DashboardShell
      items={recruiterNav}
      title="Overview"
      actions={
        <Button as={Link} href="/recruiter/jobs/new" size="sm">
          <Plus className="h-4 w-4" /> New Job
        </Button>
      }
    >
      <h2 className="font-display text-xl font-semibold">Welcome back, {firstName}</h2>

      {company === null && (
        <Card className="mt-4 flex items-center justify-between gap-4 border-signal-amber/30 bg-signal-amber/5">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-signal-amber" />
            <p className="text-sm">
              You haven't set up your company profile yet — jobs can't be posted until you do.
            </p>
          </div>
          <Button as={Link} href="/recruiter/company" size="sm" variant="outline">
            Set up now
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Briefcase} label="Active Jobs" value={publishedCount} tone="text-signal-mint" />
        <StatCard icon={FileEdit} label="Drafts" value={draftCount} tone="text-signal-amber" />
        <StatCard icon={CheckCircle2} label="Total Jobs" value={jobs.length} tone="text-signal-violet" />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Recent jobs</h3>
          <Link href="/recruiter/jobs" className="text-sm font-medium text-signal-violet hover:underline">
            View all
          </Link>
        </div>

        {jobs.length === 0 ? (
          <Card className="py-10 text-center text-sm text-current/60">
            No jobs posted yet. Applicant comparisons, assessment performance, and Candidate
            Intelligence reports will appear here starting in Phase 8–12.
          </Card>
        ) : (
          <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium">{job.title}</p>
                  <p className="text-xs text-current/50">{job.location}</p>
                </div>
                <JobStatusBadge isPublished={job.isPublished} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-display text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-3 text-sm text-current/60">{label}</p>
    </Card>
  );
}
