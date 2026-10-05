"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { candidateNav } from "@/components/dashboard/candidateNav";
import NotificationsPageBody from "@/components/notifications/NotificationsPageBody";

export default function CandidateNotificationsPage() {
  return (
    <ProtectedRoute allow={["CANDIDATE"]}>
      <DashboardShell items={candidateNav} title="Notifications">
        <NotificationsPageBody />
      </DashboardShell>
    </ProtectedRoute>
  );
}
