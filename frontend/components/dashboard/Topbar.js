"use client";

import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Topbar({ title, onMenuClick, actions }) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <header className="relative z-20 flex h-16 items-center justify-between border-b border-line-light bg-paper/80 px-4 backdrop-blur dark:border-line-dark dark:bg-ink/80 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-paper-softer dark:hover:bg-ink-softer lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <NotificationBell />
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-paper-softer dark:hover:bg-ink-softer"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
