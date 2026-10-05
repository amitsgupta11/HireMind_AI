"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { resumeApi } from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024;

// Real drag & drop with real client-side validation and a real upload
// progress bar (driven by XHR upload events, not a fake timer). Status
// only ever reflects what actually happened: Uploading -> Uploaded, or
// an inline error. No fake "Analyzing"/"Completed" states — those become
// real once the Redis/BullMQ worker (Phase 5) and AI parser (Phase 6) ship.
export default function ResumeDropzone({ onUploaded }) {
  const { token } = useAuth();
  const { showToast } = useToast();
  const inputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | uploading | uploaded | error
  const [error, setError] = useState("");

  const validate = (f) => {
    if (f.type !== "application/pdf") return "Only PDF files are accepted.";
    if (f.size > MAX_SIZE) return "File is too large — 5MB maximum.";
    return null;
  };

  const startUpload = useCallback(
    async (f) => {
      const validationError = validate(f);
      if (validationError) {
        setError(validationError);
        setStatus("error");
        return;
      }

      setFile(f);
      setError("");
      setStatus("uploading");
      setProgress(0);

      try {
        const res = await resumeApi.uploadWithProgress(f, token, setProgress);
        setStatus("uploaded");
        showToast("Resume uploaded.");
        onUploaded?.(res.data.resume);
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    },
    [token, onUploaded, showToast]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) startUpload(f);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragOver
            ? "border-signal-violet bg-signal-gradient-soft"
            : "border-line-light dark:border-line-dark"
        )}
      >
        {status === "idle" && (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-gradient-soft text-signal-violet">
              <UploadCloud className="h-6 w-6" />
            </span>
            <p className="font-medium">Drag & drop your resume here</p>
            <p className="text-sm text-current/50">PDF only, up to 5MB</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-2 text-sm font-medium text-signal-violet hover:underline"
            >
              or browse a file
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && startUpload(e.target.files[0])}
            />
          </>
        )}

        {status === "uploading" && (
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-signal-violet" />
              {file?.name}
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-paper-softer dark:bg-ink-softer">
              <motion.div
                className="h-full rounded-full bg-signal-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <p className="mt-2 text-xs text-current/50">Uploading — {progress}%</p>
          </div>
        )}

        {status === "uploaded" && (
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-mint/10 text-signal-mint">
              <FileText className="h-6 w-6" />
            </span>
            <p className="font-medium">{file?.name}</p>
            <p className="text-xs text-signal-mint">Uploaded successfully</p>
            <button
              type="button"
              onClick={reset}
              className="mt-1 flex items-center gap-1 text-xs text-current/50 hover:text-current"
            >
              <X className="h-3 w-3" /> Upload a different file
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex w-full max-w-sm flex-col items-center gap-2">
            <p className="text-sm text-signal-rose">{error}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-signal-violet hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
