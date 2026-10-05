"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ResumeDropzone from "@/components/candidate/ResumeDropzone";
import ResumeProcessingStatus from "@/components/candidate/ResumeProcessingStatus";
import ResumeIntelligenceReport from "@/components/candidate/ResumeIntelligenceReport";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api";

export default function ResumeIntelligencePage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <ResumePageBody />
    </ProtectedRoute>
  );
}

function ResumePageBody() {
  const { token } = useAuth();
  const [resumes, setResumes] = useState(null);
  const [error, setError] = useState("");
  const [latestLive, setLatestLive] = useState(null);

  const load = useCallback(() => {
    if (!token) return;
    resumeApi
      .listMine(token)
      .then((res) => {
        setResumes(res.data.resumes);
        setLatestLive(res.data.resumes[0] || null);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(load, [load]);

  return (
    <DashboardShell items={candidateNav} title="Resume Intelligence">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <h2 className="font-display text-lg font-semibold">Upload your resume</h2>
          <p className="mt-1 text-sm text-current/60">
            Uploading a new version replaces which one recruiters see as your latest.
          </p>
          <div className="mt-6">
            <ResumeDropzone onUploaded={load} />
          </div>
        </Card>

        {latestLive && (
          <Card>
            <h3 className="mb-1 font-display text-base font-semibold">Processing status</h3>
            <p className="mb-4 text-sm text-current/60">
              Your resume moves through a real background pipeline — nothing here is simulated.
            </p>
            <ResumeProcessingStatus resume={latestLive} onUpdate={setLatestLive} />
          </Card>
        )}

        {latestLive && <ResumeIntelligenceReport resume={latestLive} />}

        <Card>
          <h3 className="mb-4 font-display text-base font-semibold">Upload history</h3>
          {resumes === null && !error && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-signal-violet" />
            </div>
          )}
          {error && <p className="text-sm text-signal-rose">{error}</p>}
          {resumes?.length === 0 && (
            <p className="text-sm text-current/50">No resumes uploaded yet.</p>
          )}
          {resumes && resumes.length > 0 && (
            <ul className="divide-y divide-line-light dark:divide-line-dark">
              {resumes.map((r, i) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-current/40" />
                    <div>
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline"
                      >
                        {r.fileName}
                      </a>
                      <p className="text-xs text-current/40">
                        {(r.sizeBytes / 1024).toFixed(0)} KB · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.resumeScore != null && (
                      <span className="font-mono text-xs font-semibold text-signal-violet">
                        {r.resumeScore}/100
                      </span>
                    )}
                    {i === 0 ? <Badge tone="mint">Latest</Badge> : <Badge tone="violet">{r.status}</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
