"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "@/components/layout/Logo";

// Shared sidebar shell for both Candidate and Recruiter dashboards.
// `items` decides what's real vs. "coming soon" per phase — nothing here
// links anywhere that doesn't actually exist yet.
export default function Sidebar({ items, footer, mobile = false }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-64 shrink-0 flex-col border-r border-line-light bg-paper-soft/60 dark:border-line-dark dark:bg-ink-soft/40",
        mobile ? "flex h-full" : "hidden lg:flex"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-line-light px-6 dark:border-line-dark">
        <Logo className="h-7 w-7" />
        <span className="font-display text-base font-semibold">HireMind AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {items.map((item) => {
          const active = item.href && pathname === item.href;
          const disabled = !item.href;

          const content = (
            <>
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {disabled && (
                <span className="rounded-full bg-paper-softer px-2 py-0.5 text-[10px] font-medium text-current/40 dark:bg-ink-softer">
                  Soon
                </span>
              )}
            </>
          );

          const className = cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-signal-gradient-soft text-signal-violet"
              : disabled
              ? "cursor-not-allowed text-current/35"
              : "text-current/70 hover:bg-paper-softer hover:text-current dark:hover:bg-ink-softer"
          );

          return disabled ? (
            <div key={item.label} className={className}>
              {content}
            </div>
          ) : (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </nav>

      {footer && <div className="border-t border-line-light p-4 dark:border-line-dark">{footer}</div>}
    </aside>
  );
}
