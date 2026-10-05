import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line-light dark:border-line-dark">
      <div className="container-shell grid gap-10 py-16 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-display text-lg font-semibold">HireMind AI</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-current/60">
            Intelligence behind every hire.
          </p>
        </div>

        <FooterColumn
          title="Platform"
          links={["For Candidates", "For Recruiters", "AI Intelligence", "Pricing"]}
        />
        <FooterColumn
          title="Company"
          links={["About", "Careers", "Security", "Contact"]}
        />
        <FooterColumn
          title="Legal"
          links={["Privacy Policy", "Terms of Service"]}
        />
      </div>
      <div className="container-shell flex flex-col items-center justify-between gap-4 border-t border-line-light py-6 text-xs text-current/50 dark:border-line-dark sm:flex-row">
        <span>© {new Date().getFullYear()} HireMind AI. All rights reserved.</span>
        <span>Built for recruiters and candidates who want the full picture.</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-display text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((label) => (
          <li key={label}>
            <a href="#" className="text-sm text-current/60 hover:text-current">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
