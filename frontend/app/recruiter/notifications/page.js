"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { recruiterNav } from "@/components/dashboard/recruiterNav";
import NotificationsPageBody from "@/components/notifications/NotificationsPageBody";

export default function RecruiterNotificationsPage() {
  return (
    <ProtectedRoute allow={["RECRUITER"]}>
      <DashboardShell items={recruiterNav} title="Notifications">
        <NotificationsPageBody />
      </DashboardShell>
    </ProtectedRoute>
  );
}
