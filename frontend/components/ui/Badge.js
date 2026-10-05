import { cn } from "@/lib/utils";

const tones = {
  violet: "bg-signal-violet/10 text-signal-violet border-signal-violet/20",
  cyan: "bg-signal-cyan/10 text-[#0E7490] dark:text-signal-cyan border-signal-cyan/20",
  mint: "bg-signal-mint/10 text-[#0F766E] dark:text-signal-mint border-signal-mint/20",
  amber: "bg-signal-amber/10 text-[#92620A] dark:text-signal-amber border-signal-amber/20",
  rose: "bg-signal-rose/10 text-signal-rose border-signal-rose/20",
};

export default function Badge({ tone = "violet", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
