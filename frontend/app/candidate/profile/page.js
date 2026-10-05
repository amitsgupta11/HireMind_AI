"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { candidateApi } from "@/lib/api";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  headline: z.string().max(150, "Keep it under 150 characters").optional().or(z.literal("")),
  location: z.string().max(120, "Keep it under 120 characters").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
});

export default function CandidateProfilePage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <ProfilePageBody />
    </ProtectedRoute>
  );
}

function ProfilePageBody() {
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
    candidateApi
      .getMe(token)
      .then((res) => {
        const p = res.data.profile;
        reset({
          fullName: p.fullName || "",
          headline: p.headline || "",
          location: p.location || "",
          phone: p.phone || "",
        });
      })
      .catch((err) => setServerError(err.message))
      .finally(() => setLoading(false));
  }, [token, reset]);

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await candidateApi.updateMe(data, token);
      showToast("Profile updated.");
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <DashboardShell items={candidateNav} title="My Profile">
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
            <UserCircle className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Your profile</h2>
            <p className="text-sm text-current/60">
              Recruiters see this alongside your Resume Intelligence and match scores.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input label="Full name" error={errors.fullName?.message} {...register("fullName")} />
            <Input
              label="Headline"
              placeholder="Senior Frontend Engineer"
              error={errors.headline?.message}
              {...register("headline")}
            />
            <Input
              label="Location"
              placeholder="Bengaluru, India"
              error={errors.location?.message}
              {...register("location")}
            />
            <Input label="Phone" placeholder="+91 98765 43210" error={errors.phone?.message} {...register("phone")} />

            {serverError && (
              <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
                {serverError}
              </p>
            )}

            <Button type="submit" loading={isSubmitting}>
              Save profile
            </Button>
          </form>
        )}
      </Card>
    </DashboardShell>
  );
}
