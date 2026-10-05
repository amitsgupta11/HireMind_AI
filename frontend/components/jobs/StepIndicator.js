import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <ol className="mb-8 flex flex-wrap gap-y-4">
      {steps.map((step, i) => {
        const state = i < currentStep ? "done" : i === currentStep ? "active" : "upcoming";
        return (
          <li key={step} className="flex flex-1 min-w-[120px] items-center">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  state === "done" && "bg-signal-gradient text-white",
                  state === "active" && "border-2 border-signal-violet text-signal-violet",
                  state === "upcoming" && "border border-line-light text-current/40 dark:border-line-dark"
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  state === "upcoming" ? "text-current/40" : "text-current"
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mx-3 hidden h-px flex-1 sm:block",
                  state === "done" ? "bg-signal-violet" : "bg-line-light dark:bg-line-dark"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
