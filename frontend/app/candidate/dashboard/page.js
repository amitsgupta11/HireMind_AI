"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, UserCircle, UploadCloud } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { resumeApi } from "@/lib/api";

export default function CandidateDashboardPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <DashboardBody />
    </ProtectedRoute>
  );
}

function DashboardBody() {
  const { user, token } = useAuth();
  const [latestResume, setLatestResume] = useState(undefined);
  const firstName = user?.candidateProfile?.fullName?.split(" ")[0] || "there";

  useEffect(() => {
    if (!token) return;
    resumeApi
      .getLatest(token)
      .then((res) => setLatestResume(res.data.resume))
      .catch(() => setLatestResume(null));
  }, [token]);

  return (
    <DashboardShell items={candidateNav} title="Overview">
      <h2 className="font-display text-xl font-semibold">Good to see you, {firstName}</h2>

      {latestResume === null && (
        <Card className="mt-4 flex items-center justify-between gap-4 border-signal-amber/30 bg-signal-amber/5">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-signal-amber" />
            <p className="text-sm">Upload your resume to unlock Resume Intelligence and job matches.</p>
          </div>
          <Button as={Link} href="/candidate/resume" size="sm" variant="outline">
            Upload now
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
              <UserCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium">Profile</p>
              <p className="text-xs text-current/50">
                {user?.candidateProfile?.headline || "Add a headline and location"}
              </p>
            </div>
          </div>
          <Button as={Link} href="/candidate/profile" variant="outline" size="sm" className="mt-4 w-full">
            Edit profile
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="font-medium">Resume</p>
              <p className="text-xs text-current/50">
                {latestResume ? latestResume.fileName : latestResume === null ? "Not uploaded yet" : "Loading..."}
              </p>
              {latestResume?.resumeScore != null && (
                <p className="mt-0.5 text-xs font-semibold text-signal-violet">
                  Score: {latestResume.resumeScore}/100
                </p>
              )}
            </div>
          </div>
          <Button as={Link} href="/candidate/resume" variant="outline" size="sm" className="mt-4 w-full">
            {latestResume ? "Manage resume" : "Upload resume"}
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <p className="text-sm text-current/60">
          Job Matches, Assessments, and AI Interview will appear here starting in Phase 7+.
          Authentication, profile, and resume upload are fully working.
        </p>
      </Card>
    </DashboardShell>
  );
}
