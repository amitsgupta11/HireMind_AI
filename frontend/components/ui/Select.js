"use client";

import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = forwardRef(function Select(
  { label, error, options = [], placeholder, className, id, ...props },
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
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-line-light bg-paper-soft px-4 pr-10 text-sm outline-none",
            "transition-colors dark:border-line-dark dark:bg-ink-softer",
            "focus:border-signal-violet",
            error && "border-signal-rose focus:border-signal-rose",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-current/40" />
      </div>
      {error && <p className="mt-1.5 text-xs text-signal-rose">{error}</p>}
    </div>
  );
});

export default Select;
