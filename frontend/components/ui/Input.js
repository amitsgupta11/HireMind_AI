"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable form input — label, inline error, and a password-visibility
// toggle when type="password". Every auth form shares this one component.
const Input = forwardRef(function Input(
  { label, error, type = "text", className, id, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-xl border border-line-light bg-paper-soft px-4 text-sm outline-none",
            "transition-colors placeholder:text-current/35 dark:border-line-dark dark:bg-ink-softer",
            "focus:border-signal-violet",
            error && "border-signal-rose focus:border-signal-rose",
            isPassword && "pr-11",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-current/40 hover:text-current/70"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-signal-rose">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
