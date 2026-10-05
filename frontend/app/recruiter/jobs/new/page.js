"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import JobWizard from "@/components/jobs/JobWizard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { jobsApi } from "@/lib/api";

export default function NewJobPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <NewJobPageBody />
    </ProtectedRoute>
  );
}

function NewJobPageBody() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

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
      await jobsApi.create(payload, token);
      showToast(isPublished ? "Job published." : "Job saved as draft.");
      router.push("/recruiter/jobs");
    } catch (err) {
      if (err.errorCode === "NO_COMPANY") {
        setServerError("Create your company profile before posting a job.");
      } else {
        setServerError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell items={recruiterNav} title="New Job">
      <JobWizard onSubmit={handleSubmit} submitting={submitting} serverError={serverError} />
    </DashboardShell>
  );
}
