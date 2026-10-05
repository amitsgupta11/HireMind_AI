import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED"];
const STAGE_LABEL = { APPLIED: "Applied", UNDER_REVIEW: "Under Review", SHORTLISTED: "Decision" };

// A simple linear timeline. REJECTED is shown as a distinct end-state
// rather than forced onto the same line as SHORTLISTED, since they are
// alternate outcomes, not sequential stages.
export default function StatusTimeline({ status }) {
  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 text-signal-rose">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-rose/15 text-xs font-semibold">
          ✕
        </span>
        <span className="text-sm font-medium">Application not moving forward</span>
      </div>
    );
  }

  const effectiveStatus = ["ASSESSMENT_ASSIGNED", "INTERVIEW_ASSIGNED"].includes(status)
    ? "UNDER_REVIEW"
    : status;
  const currentIndex = STAGES.indexOf(effectiveStatus);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
                i <= currentIndex ? "bg-signal-gradient text-white" : "border border-line-light text-current/30 dark:border-line-dark"
              )}
            >
              {i < currentIndex ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="text-[10px] text-current/50">{STAGE_LABEL[stage]}</span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={cn("mx-2 h-px flex-1", i < currentIndex ? "bg-signal-violet" : "bg-line-light dark:bg-line-dark")} />
          )}
        </div>
      ))}
    </div>
  );
}
