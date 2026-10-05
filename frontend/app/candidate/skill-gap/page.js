"use client";

import { useEffect, useState } from "react";
import { Loader2, Target, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { jobsApi } from "@/lib/api";

export default function SkillGapPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <SkillGapBody />
    </ProtectedRoute>
  );
}

function SkillGapBody() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gaps, setGaps] = useState([]);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    jobsApi
      .discover(token)
      .then((res) => {
        const jobs = res.data.jobs;
        setJobCount(jobs.length);

        // Real aggregation: how many open jobs require each missing skill.
        const freq = {};
        jobs.forEach((job) => {
          (job.match?.missingSkills || []).forEach((skill) => {
            const key = skill.trim();
            freq[key] = (freq[key] || 0) + 1;
          });
        });

        const ranked = Object.entries(freq)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);

        setGaps(ranked);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardShell items={candidateNav} title="Skill Gap">
      <Card className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
            <Target className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold">Skill gap analysis</h2>
            <p className="text-sm text-current/60">
              Calculated from the {jobCount} open job{jobCount === 1 ? "" : "s"} matched against
              your resume — these are the skills most often missing.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      ) : error ? (
        <Card>
          <p className="text-sm text-signal-rose">{error}</p>
        </Card>
      ) : gaps.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <TrendingUp className="h-8 w-8 text-current/30" />
          <p className="text-sm text-current/50">
            No skill gaps found — your resume already covers every open job's required skills.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="divide-y divide-line-light dark:divide-line-dark">
            {gaps.map(({ skill, count }) => (
              <div key={skill} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm font-medium">{skill}</span>
                <span className="text-xs text-current/50">
                  Needed in {count} of {jobCount} jobs
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardShell>
  );
}