"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";

export default function AnalyticsPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <AnalyticsBody />
    </ProtectedRoute>
  );
}

function AnalyticsBody() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest("/analytics/recruiter", { token })
      .then((res) => setAnalytics(res.data.analytics))
      .catch((err) => setError(err.message));
  }, [token]);

  if (analytics === undefined && !error) {
    return (
      <DashboardShell items={recruiterNav} title="Analytics">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell items={recruiterNav} title="Analytics">
        <Card><p className="text-sm text-signal-rose">{error}</p></Card>
      </DashboardShell>
    );
  }

  const noData = analytics.totalJobs === 0;

  return (
    <DashboardShell items={recruiterNav} title="Analytics">
      {noData ? (
        <Card className="py-16 text-center text-sm text-current/50">
          Post your first job to start seeing analytics here.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-4 font-display text-sm font-semibold">Applications over time (14 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6C5CE7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-sm font-semibold">Candidate Intelligence distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22D3EE" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-sm font-semibold">Skill demand across your jobs</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.skillDemand} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#2DD4A7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-sm font-semibold">Hiring funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.hiringFunnel}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="status" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B7CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
