"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import RoleToggle from "@/components/auth/RoleToggle";
import PasswordStrength from "@/components/auth/PasswordStrength";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
  role: z.enum(["CANDIDATE", "RECRUITER"]),
});

function RegisterForm() {
  const { register: signup } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");

  const defaultRole = searchParams.get("role") === "recruiter" ? "RECRUITER" : "CANDIDATE";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const role = watch("role");
  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await signup(data);
      showToast("Account created — welcome to HireMind AI.");
    } catch (err) {
      if (err.errorCode === "EMAIL_TAKEN") {
        setServerError("An account with this email already exists.");
      } else {
        setServerError(err.message);
      }
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      subtitle="It takes less than a minute."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <RoleToggle value={role} onChange={(v) => setValue("role", v, { shouldValidate: true })} />

        <Input
          label="Full name"
          placeholder="Ananya Rao"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
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
          <PasswordStrength password={password} />
        </div>

        {serverError && (
          <p role="alert" className="rounded-lg bg-signal-rose/10 px-3 py-2 text-sm text-signal-rose">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-sm text-current/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-signal-violet hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
