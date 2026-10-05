"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Building2, Briefcase, ClipboardList, FileCheck } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/adminNav";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <AdminDashboardBody />
    </ProtectedRoute>
  );
}

function AdminDashboardBody() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!token) return;
    adminApi.getAnalytics(token).then((res) => setAnalytics(res.data.analytics));
  }, [token]);

  if (!analytics) {
    return (
      <DashboardShell items={adminNav} title="Platform Overview">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      </DashboardShell>
    );
  }

  const stats = [
    { label: "Total Users", value: analytics.totalUsers, icon: Users },
    { label: "Candidates", value: analytics.totalCandidates, icon: Users },
    { label: "Recruiters", value: analytics.totalRecruiters, icon: Users },
    { label: "Companies", value: analytics.totalCompanies, icon: Building2 },
    { label: "Total Jobs", value: analytics.totalJobs, icon: Briefcase },
    { label: "Published Jobs", value: analytics.publishedJobs, icon: Briefcase },
    { label: "Applications", value: analytics.totalApplications, icon: ClipboardList },
    { label: "Resumes Analyzed", value: analytics.resumesCompleted, icon: FileCheck },
  ];

  return (
    <DashboardShell items={adminNav} title="Platform Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                <s.icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-semibold">{s.value}</span>
            </div>
            <p className="mt-3 text-sm text-current/60">{s.label}</p>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
