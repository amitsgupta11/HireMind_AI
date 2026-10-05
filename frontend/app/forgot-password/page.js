"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    setServerError("");
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    }
  };

  if (sent) {
    return (
      <AuthLayout eyebrow="Check your inbox" title="Reset link sent">
        <div className="rounded-2xl border border-line-light p-6 text-center dark:border-line-dark">
          <MailCheck className="mx-auto h-8 w-8 text-signal-mint" />
          <p className="mt-3 text-sm text-current/70">
            If that email is registered, a password reset link is on its way.
            It expires in 1 hour.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-signal-violet hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        {serverError && (
          <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-current/60 hover:text-current"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
