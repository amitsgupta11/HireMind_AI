"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, Loader2, MapPin, Pencil, Plus, Trash2, Eye, EyeOff, ClipboardCheck, Users } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import JobStatusBadge from "@/components/jobs/JobStatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

export default function RecruiterJobsPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <JobsPageBody />
    </ProtectedRoute>
  );
}

function JobsPageBody() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    if (!token) return;
    jobsApi
      .listMine(token)
      .then((res) => setJobs(res.data.jobs))
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  const togglePublish = async (job) => {
    setBusyId(job.id);
    try {
      await jobsApi.setPublish(job.id, !job.isPublished, token);
      showToast(job.isPublished ? "Job unpublished." : "Job published.");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async (jobId) => {
    setBusyId(jobId);
    try {
      await jobsApi.remove(jobId, token);
      showToast("Job deleted.");
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell
      items={recruiterNav}
      title="Jobs"
      actions={
        <Button as={Link} href="/recruiter/jobs/new" size="sm">
          <Plus className="h-4 w-4" /> New Job
        </Button>
      }
    >
      {jobs === null && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}

      {error && (
        <Card>
          <p className="text-sm text-signal-rose">{error}</p>
        </Card>
      )}

      {jobs?.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="font-medium">No jobs yet</p>
          <p className="max-w-sm text-sm text-current/60">
            Create your first job posting to start receiving applications.
          </p>
          <Button as={Link} href="/recruiter/jobs/new" size="sm" className="mt-2">
            <Plus className="h-4 w-4" /> Create a job
          </Button>
        </Card>
      )}

      {jobs && jobs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold leading-tight">{job.title}</h3>
                  <JobStatusBadge isPublished={job.isPublished} />
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-current/50">
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

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line-light pt-4 dark:border-line-dark">
                  <Button
                    as={Link}
                    href={`/recruiter/jobs/${job.id}/edit`}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button as={Link} href={`/recruiter/jobs/${job.id}/assessment`} variant="outline" size="sm" aria-label="Assessment">
                    <ClipboardCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button as={Link} href={`/recruiter/jobs/${job.id}/applicants`} variant="outline" size="sm" aria-label="Applicants">
                    <Users className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={busyId === job.id}
                    onClick={() => togglePublish(job)}
                    aria-label={job.isPublished ? "Unpublish" : "Publish"}
                  >
                    {job.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmDeleteId(job.id)}
                    aria-label="Delete job"
                    className="text-signal-rose hover:bg-signal-rose/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-sm">
            <h3 className="font-display text-base font-semibold">Delete this job?</h3>
            <p className="mt-2 text-sm text-current/60">
              This can't be undone. The job posting and its skill data will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-signal-rose/40 text-signal-rose hover:bg-signal-rose/10"
                loading={busyId === confirmDeleteId}
                onClick={() => confirmDelete(confirmDeleteId)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
