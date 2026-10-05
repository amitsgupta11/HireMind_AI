"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/adminNav";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/lib/api";

export default function AdminCompaniesPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <AdminCompaniesBody />
    </ProtectedRoute>
  );
}

function AdminCompaniesBody() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    if (!token) return;
    adminApi.listCompanies(token).then((res) => setCompanies(res.data.companies));
  }, [token]);

  return (
    <DashboardShell items={adminNav} title="Companies">
      {companies === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {companies?.length === 0 && <Card className="py-16 text-center text-sm text-current/50">No companies yet.</Card>}
      {companies && companies.length > 0 && (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {companies.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-current/50">{c.website}</p>
              </div>
              <div className="text-right text-xs text-current/50">
                <p>{c._count.jobs} job(s)</p>
                <p>{c._count.recruiters} recruiter(s)</p>
              </div>
            </div>
          ))}
        </Card>
      )}
    </DashboardShell>
  );
}
