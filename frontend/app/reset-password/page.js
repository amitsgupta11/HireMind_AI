"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { authApi } from "@/lib/api";

const schema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const newPassword = watch("newPassword");

  const onSubmit = async ({ newPassword }) => {
    setServerError("");
    if (!token || !email) {
      setServerError("This reset link is missing required information.");
      return;
    }
    try {
      await authApi.resetPassword({ email, token, newPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout eyebrow="Reset password" title="Invalid reset link">
        <p className="text-sm text-current/60">
          This link is missing information. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-signal-violet hover:underline"
        >
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout eyebrow="Success" title="Password updated">
        <div className="rounded-2xl border border-line-light p-6 text-center dark:border-line-dark">
          <CheckCircle2 className="mx-auto h-8 w-8 text-signal-mint" />
          <p className="mt-3 text-sm text-current/70">
            Redirecting you to sign in...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle={`Resetting password for ${email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordStrength password={newPassword} />
        </div>

        {serverError && (
          <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Update password <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
