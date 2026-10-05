"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { resumeApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STAGES = ["UPLOADED", "QUEUED", "PROCESSING", "ANALYZING", "COMPLETED"];

const STAGE_LABEL = {
  UPLOADED: "Uploaded",
  QUEUED: "Queued",
  PROCESSING: "Extracting text",
  ANALYZING: "AI analysis",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

// Polls the REAL resume status every 2s until the worker marks it
// COMPLETED or FAILED — every stage shown here reflects an actual
// database value the worker wrote (Phase 5 text extraction, Phase 6 AI
// parsing + scoring), never a fake timer or animation. Calls onUpdate
// with the latest full resume row on every poll so the parent page can
// render the Intelligence Report the moment it's ready.
export default function ResumeProcessingStatus({ resume, onUpdate }) {
  const { token } = useAuth();
  const [current, setCurrent] = useState(resume);
  const intervalRef = useRef(null);

  useEffect(() => {
    setCurrent(resume);
  }, [resume?.id]);

  useEffect(() => {
    if (!current || ["COMPLETED", "FAILED"].includes(current.status)) {
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const res = await resumeApi.getById(current.id, token);
        setCurrent(res.data.resume);
        onUpdate?.(res.data.resume);
      } catch {
        // Transient poll failure — try again on the next tick.
      }
    }, 2000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.status, token]);

  if (!current) return null;

  const isFailed = current.status === "FAILED";
  const stageIndex = STAGES.indexOf(current.status);

  return (
    <div className="rounded-2xl border border-line-light p-5 dark:border-line-dark">
      {!isFailed ? (
        <div className="flex items-center gap-2">
          {STAGES.map((stage, i) => (
            <div key={stage} className="flex flex-1 items-center gap-2">
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                    i < stageIndex
                      ? "bg-signal-gradient text-white"
                      : i === stageIndex
                      ? "border-2 border-signal-violet text-signal-violet"
                      : "border border-line-light text-current/30 dark:border-line-dark"
                  }`}
                >
                  {i < stageIndex ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : i === stageIndex && stage !== "COMPLETED" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="text-center text-[10px] leading-tight text-current/50">
                  {STAGE_LABEL[stage]}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`h-px flex-1 ${i < stageIndex ? "bg-signal-violet" : "bg-line-light dark:bg-line-dark"}`}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-3 text-signal-rose">
          <XCircle className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">Processing failed</p>
            <p className="text-xs text-current/60">{current.failureReason || "An unexpected error occurred."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
