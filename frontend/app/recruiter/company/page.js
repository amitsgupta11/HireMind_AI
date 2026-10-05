"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { companyApi } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Company name is required"),
  website: z.string().url("Include https://").optional().or(z.literal("")),
  logoUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  about: z.string().max(2000, "Keep it under 2000 characters").optional().or(z.literal("")),
});

export default function CompanyPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <CompanyPageBody />
    </ProtectedRoute>
  );
}

function CompanyPageBody() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) return;
    companyApi
      .getMine(token)
      .then((res) => {
        const company = res.data.company;
        if (company) {
          reset({
            name: company.name || "",
            website: company.website || "",
            logoUrl: company.logoUrl || "",
            about: company.about || "",
          });
        }
      })
      .catch(() => {
        // No company yet — form just starts empty, which is fine.
      })
      .finally(() => setLoading(false));
  }, [token, reset]);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await companyApi.upsertMine(data, token);
      showToast("Company profile saved.");
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <DashboardShell items={recruiterNav} title="Company">
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Company profile</h2>
            <p className="text-sm text-current/60">
              This information appears on every job you publish.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
              label="Company name"
              placeholder="Acme Inc."
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Website"
              placeholder="https://acme.com"
              error={errors.website?.message}
              {...register("website")}
            />
            <Input
              label="Logo URL"
              placeholder="https://acme.com/logo.png"
              error={errors.logoUrl?.message}
              {...register("logoUrl")}
            />
            <Textarea
              label="About"
              placeholder="What does your company do?"
              error={errors.about?.message}
              {...register("about")}
            />

            {serverError && (
              <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={isSubmitting}>
              Save company profile
            </Button>
          </form>
        )}
      </Card>
    </DashboardShell>
  );
}
