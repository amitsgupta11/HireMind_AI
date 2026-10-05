"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { SectionHeading } from "./HowItWorks";

const ROWS = [
  { name: "Ananya Rao", resume: 88, match: 92, assessment: 84, interview: 90, ci: 90, status: "Shortlisted", tone: "mint" },
  { name: "Rohan Mehta", resume: 76, match: 81, assessment: 70, interview: 74, ci: 76, status: "Under Review", tone: "amber" },
  { name: "Sara Ibrahim", resume: 65, match: 58, assessment: 60, interview: 55, ci: 59, status: "Rejected", tone: "rose" },
];

export default function RecruiterPreview() {
  return (
    <section id="recruiters" className="py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow="For recruiters"
          title="Compare candidates at a glance"
          desc="Every applicant, scored the same way, side by side."
        />

        <Card className="mt-16 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-light text-left text-xs uppercase tracking-wide text-current/50 dark:border-line-dark">
                {["Candidate", "Resume", "Match", "Assessment", "Interview", "Candidate Intelligence", "Status"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-6 py-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-line-light last:border-0 hover:bg-paper-softer/60 dark:border-line-dark dark:hover:bg-ink-softer/60"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium">{row.name}</td>
                  <td className="px-6 py-4 font-mono">{row.resume}</td>
                  <td className="px-6 py-4 font-mono">{row.match}%</td>
                  <td className="px-6 py-4 font-mono">{row.assessment}</td>
                  <td className="px-6 py-4 font-mono">{row.interview}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-signal-violet">{row.ci}</td>
                  <td className="px-6 py-4">
                    <Badge tone={row.tone}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}
