"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
    } catch (err) {
      if (err.errorCode === "ACCOUNT_SUSPENDED") {
        setServerError("This account has been suspended. Contact support for help.");
      } else {
        setServerError("Incorrect email or password.");
      }
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to HireMind AI"
      subtitle="Enter your credentials to continue."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="mt-1.5 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-signal-violet hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {serverError && (
          <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-current/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-signal-violet hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
