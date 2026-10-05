"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Textarea = forwardRef(function Textarea(
  { label, error, className, id, rows = 5, ...props },
  ref
) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full resize-none rounded-xl border border-line-light bg-paper-soft px-4 py-3 text-sm outline-none",
          "transition-colors placeholder:text-current/35 dark:border-line-dark dark:bg-ink-softer",
          "focus:border-signal-violet",
          error && "border-signal-rose focus:border-signal-rose",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-signal-rose">{error}</p>}
    </div>
  );
});

export default Textarea;
