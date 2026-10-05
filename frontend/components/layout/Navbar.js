"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import Logo from "./Logo";
import Button from "@/components/ui/Button";
import { useTheme } from "./ThemeProvider";
import { useAuth, DASHBOARD_BY_ROLE } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "For Candidates", href: "#candidates" },
  { label: "For Recruiters", href: "#recruiters" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "AI Intelligence", href: "#intelligence" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout, loading } = useAuth();
  const dashboardHref = user ? DASHBOARD_BY_ROLE[user.role] || "/" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass-panel border-b" : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold">HireMind AI</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-current/70 transition-colors hover:text-current"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-paper-softer dark:hover:bg-ink-softer"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {!loading && user ? (
            <>
              <Button as={Link} href={dashboardHref} variant="ghost" size="sm">
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} href="/login" variant="ghost" size="sm">
                Sign In
              </Button>
              <Button as={Link} href="/register" size="sm">
                Get Started
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="glass-panel border-t lg:hidden">
          <div className="container-shell flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-paper-softer dark:hover:bg-ink-softer"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 px-3">
              {!loading && user ? (
                <>
                  <Button as={Link} href={dashboardHref} variant="outline" size="sm" className="flex-1">
                    Dashboard
                  </Button>
                  <Button size="sm" className="flex-1" onClick={logout}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button as={Link} href="/login" variant="outline" size="sm" className="flex-1">
                    Sign In
                  </Button>
                  <Button as={Link} href="/register" size="sm" className="flex-1">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
