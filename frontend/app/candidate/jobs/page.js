"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Search } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

export default function FindJobsPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <FindJobsBody />
    </ProtectedRoute>
  );
}

function FindJobsBody() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(
    (query = {}) => {
      if (!token) return;
      jobsApi
        .discover(token, query)
        .then((res) => setJobs(res.data.jobs))
        .catch((err) => setError(err.message));
    },
    [token]
  );

  useEffect(() => load(), [load]);

  const onSearch = (e) => {
    e.preventDefault();
    load(search ? { search } : {});
  };

  return (
    <DashboardShell items={candidateNav} title="Find Jobs">
      <form onSubmit={onSearch} className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-current/40" />
          <Input
            placeholder="Search by job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11"
          />
        </div>
      </form>

      {jobs === null && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}

      {error && (
        <Card>
          <p className="text-sm text-signal-rose">
            {error.includes("RESUME_NOT_READY") || error.toLowerCase().includes("resume")
              ? "Complete your resume analysis first to see job matches."
              : error}
          </p>
          {error.toLowerCase().includes("resume") && (
            <Link href="/candidate/resume" className="mt-2 inline-block text-sm font-medium text-signal-violet hover:underline">
              Go to Resume Intelligence →
            </Link>
          )}
        </Card>
      )}

      {jobs?.length === 0 && (
        <Card className="py-16 text-center text-sm text-current/50">No published jobs match your search yet.</Card>
      )}

      {jobs && jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/candidate/jobs/${job.id}`}>
              <Card className="flex h-full flex-col transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold leading-tight">{job.title}</h3>
                  <span className="shrink-0 rounded-full bg-signal-gradient px-2.5 py-1 text-xs font-semibold text-white">
                    {job.match.overall}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-current/50">{job.company?.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-current/50">
                  <MapPin className="h-3 w-3" /> {job.location}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills
                    ?.filter((s) => s.level === "REQUIRED")
                    .slice(0, 4)
                    .map((s) => (
                      <Badge key={s.id} tone="violet" className="text-[10px]">
                        {s.name}
                      </Badge>
                    ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
