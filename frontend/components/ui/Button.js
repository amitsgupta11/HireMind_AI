"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-signal-gradient text-white shadow-glow hover:brightness-110 active:brightness-95",
  secondary:
    "glass-panel text-current hover:bg-paper-softer/80 dark:hover:bg-ink-softer/80",
  ghost:
    "bg-transparent text-current hover:bg-paper-softer dark:hover:bg-ink-softer",
  outline:
    "border border-line-light dark:border-line-dark bg-transparent hover:bg-paper-softer dark:hover:bg-ink-softer",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

// Base Button — never looks clickable unless it actually does something.
// Handles loading + disabled states consistently across the whole app.
export default function Button({
  as: Comp = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}) {
  return (
    <Comp
      disabled={disabled || loading}
      aria-busy={loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium",
        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
}
