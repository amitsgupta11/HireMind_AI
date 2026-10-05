import Link from "next/link";
import Logo from "@/components/layout/Logo";

// Shared split-panel shell for every auth screen — a quiet form panel on
// one side, the signal-gradient brand panel on the other. Keeps the whole
// auth flow visually consistent without duplicating layout markup.
export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20">
        <Link href="/" className="mb-10 flex items-center gap-2">
          <Logo />
          <span className="font-display text-lg font-semibold">HireMind AI</span>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-widest text-signal-violet">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-current/60">{subtitle}</p>}

          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-signal-gradient lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 70%, white 0, transparent 35%)",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-16 text-center text-white">
          <p className="font-display text-3xl font-semibold leading-tight">
            Intelligence behind every hire.
          </p>
          <p className="mt-4 max-w-sm text-white/75">
            Explainable Candidate Intelligence — every score comes with a reason,
            and the final decision always stays with you.
          </p>
        </div>
      </div>
    </div>
  );
}
