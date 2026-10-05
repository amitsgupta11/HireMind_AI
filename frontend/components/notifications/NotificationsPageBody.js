"use client";

import { Bell, CheckCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

const TYPE_TONE = {
  SHORTLISTED: "text-signal-mint",
  REJECTED: "text-signal-rose",
  RESUME_PROCESSED: "text-signal-violet",
  ASSESSMENT_ASSIGNED: "text-signal-amber",
  APPLICATION_STATUS: "text-signal-cyan",
};

export default function NotificationsPageBody() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-current/60">{unreadCount} unread</p>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-1 text-sm font-medium text-signal-violet hover:underline">
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <Bell className="h-8 w-8 text-current/30" />
          <p className="text-sm text-current/50">No notifications yet.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-line-light p-0 dark:divide-line-dark">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markAsRead(n.id)}
              className={cn(
                "flex w-full flex-col items-start gap-1 px-6 py-4 text-left transition-colors hover:bg-paper-softer/60 dark:hover:bg-ink-softer/60",
                !n.isRead && "bg-signal-gradient-soft"
              )}
            >
              <span className={cn("text-sm font-medium", TYPE_TONE[n.type] || "text-current")}>{n.title}</span>
              <span className="text-sm text-current/60">{n.message}</span>
              <span className="text-xs text-current/35">{new Date(n.createdAt).toLocaleString()}</span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
