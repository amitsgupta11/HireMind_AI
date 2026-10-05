"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

// Wraps every dashboard page: sidebar (desktop) + slide-over sidebar
// (mobile) + topbar + scrollable content area.
export default function DashboardShell({ items, title, actions, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink">
      <Sidebar items={items} />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 bg-paper-soft dark:bg-ink-soft">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 hover:bg-paper-softer dark:hover:bg-ink-softer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar items={items} mobile />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} actions={actions} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
