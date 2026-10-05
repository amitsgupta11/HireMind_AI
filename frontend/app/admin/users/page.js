"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Ban, CheckCircle2 } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { adminNav } from "@/components/dashboard/adminNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { adminApi } from "@/lib/api";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allow={["ADMIN"]}>
      <AdminUsersBody />
    </ProtectedRoute>
  );
}

function AdminUsersBody() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    adminApi.listUsers(token).then((res) => setUsers(res.data.users));
  }, [token]);

  useEffect(load, [load]);

  const toggleStatus = async (user) => {
    setBusyId(user.id);
    try {
      await adminApi.setUserStatus(user.id, user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE", token);
      showToast(user.status === "ACTIVE" ? "User suspended." : "User activated.");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell items={adminNav} title="Users">
      {users === null && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-signal-violet" />
        </div>
      )}
      {users && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-light text-left text-xs uppercase tracking-wide text-current/50 dark:border-line-dark">
                {["Name", "Email", "Role", "Status", "Action"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-6 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line-light last:border-0 dark:border-line-dark">
                  <td className="whitespace-nowrap px-6 py-4">
                    {u.candidateProfile?.fullName || u.recruiterProfile?.fullName || "—"}
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge tone="violet">{u.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={u.status === "ACTIVE" ? "mint" : "rose"}>{u.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {u.role !== "ADMIN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={busyId === u.id}
                        onClick={() => toggleStatus(u)}
                        className={u.status === "ACTIVE" ? "text-signal-rose hover:bg-signal-rose/10" : "text-signal-mint hover:bg-signal-mint/10"}
                      >
                        {u.status === "ACTIVE" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DashboardShell>
  );
}
