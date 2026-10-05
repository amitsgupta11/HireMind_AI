"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must include an uppercase letter")
      .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function CandidateSettingsPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <SettingsPageBody />
    </ProtectedRoute>
  );
}

function SettingsPageBody() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await authApi.changePassword(
        { currentPassword: data.currentPassword, newPassword: data.newPassword },
        token
      );
      showToast("Password updated.");
      reset();
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <DashboardShell items={recruiterNav} title="Settings">
      <Card className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Change password</h2>
            <p className="text-sm text-current/60">
              Update the password you use to sign in to HireMind AI.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="Current password"
            type="password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <Input
            label="New password"
            type="password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          {serverError && (
            <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
              {serverError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}