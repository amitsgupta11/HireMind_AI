"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import JobWizard from "@/components/jobs/JobWizard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { jobsApi } from "@/lib/api";

export default function EditJobPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <EditJobPageBody />
    </ProtectedRoute>
  );
}

function EditJobPageBody() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [initialValues, setInitialValues] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    jobsApi
      .getById(id)
      .then((res) => {
        const job = res.data.job;
        setInitialValues({
          title: job.title,
          location: job.location,
          employmentType: job.employmentType || "",
          description: job.description,
          requiredSkills: job.skills.filter((s) => s.level === "REQUIRED").map((s) => s.name),
          preferredSkills: job.skills.filter((s) => s.level === "PREFERRED").map((s) => s.name),
          experienceMin: job.experienceMin ?? 0,
          experienceMax: job.experienceMax ?? "",
          salaryMin: job.salaryMin ?? "",
          salaryMax: job.salaryMax ?? "",
        });
      })
      .catch((err) => setLoadError(err.message));
  }, [id]);

  const handleSubmit = async (data, isPublished) => {
    setSubmitting(true);
    setServerError("");
    try {
      const payload = {
        ...data,
        experienceMax: data.experienceMax === "" ? undefined : data.experienceMax,
        salaryMin: data.salaryMin === "" ? undefined : data.salaryMin,
        salaryMax: data.salaryMax === "" ? undefined : data.salaryMax,
        isPublished,
      };
      await jobsApi.update(id, payload, token);
      showToast(isPublished ? "Job updated and published." : "Job updated.");
      router.push("/recruiter/jobs");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell items={recruiterNav} title="Edit Job">
      {loadError && <p className="text-sm text-signal-rose">{loadError}</p>}
      {!initialValues && !loadError && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {initialValues && (
        <JobWizard
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitting={submitting}
          serverError={serverError}
        />
      )}
    </DashboardShell>
  );
}
