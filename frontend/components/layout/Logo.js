// Minimal abstract mark: a profile silhouette merging into a check —
// "a person, understood, confirmed." Pure inline SVG, no external assets.
export default function Logo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hm-logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#6C5CE7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" stroke="url(#hm-logo-grad)" strokeWidth="2" />
      <path
        d="M13 26c0-4.5 3.2-7.5 7-7.5s7 3 7 7.5"
        stroke="url(#hm-logo-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="20" cy="14.5" r="4.2" fill="url(#hm-logo-grad)" />
    </svg>
  );
}
