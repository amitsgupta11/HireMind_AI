"use client";

import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

const TYPE_TONE = {
  SHORTLISTED: "text-signal-mint",
  REJECTED: "text-signal-rose",
  RESUME_PROCESSED: "text-signal-violet",
  ASSESSMENT_ASSIGNED: "text-signal-amber",
  APPLICATION_STATUS: "text-signal-cyan",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper-softer dark:hover:bg-ink-softer"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-signal-rose px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 max-h-[75vh] overflow-hidden rounded-2xl border border-line-light bg-paper shadow-glass dark:border-line-dark dark:bg-ink-soft">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-medium text-signal-violet hover:underline"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-current/40">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper-softer dark:hover:bg-ink-softer",
                      !n.isRead && "bg-signal-gradient-soft"
                    )}
                  >
                    <span className={cn("text-sm font-medium", TYPE_TONE[n.type] || "text-current")}>
                      {n.title}
                    </span>
                    <span className="text-xs text-current/60">{n.message}</span>
                    <span className="text-[10px] text-current/35">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
