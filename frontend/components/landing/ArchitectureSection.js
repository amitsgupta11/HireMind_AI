import { Layout, Server, Database, Workflow, BrainCircuit, Cloud } from "lucide-react";
import Card from "@/components/ui/Card";
import { SectionHeading } from "./HowItWorks";

const LAYERS = [
  { icon: Layout, label: "Frontend", desc: "Next.js + React" },
  { icon: Server, label: "API", desc: "Express + RBAC" },
  { icon: Database, label: "PostgreSQL", desc: "Prisma ORM" },
  { icon: Workflow, label: "Redis / BullMQ", desc: "Background workers" },
  { icon: BrainCircuit, label: "AI Services", desc: "Structured, validated output" },
  { icon: Cloud, label: "AWS S3", desc: "Resume storage" },
];

export default function ArchitectureSection() {
  return (
    <section id="platform" className="py-28">
      <div className="container-shell">
        <SectionHeading
          eyebrow="Architecture"
          title="Built like production software, not a prototype"
          desc="Every layer has one job. Nothing is faked, and nothing skips the queue."
        />

        <div className="mt-16 flex flex-col items-center gap-3">
          {LAYERS.map((layer, i) => (
            <div key={layer.label} className="flex w-full max-w-md flex-col items-center">
              <Card className="flex w-full items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal-gradient-soft text-signal-violet">
                  <layer.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{layer.label}</p>
                  <p className="text-xs text-current/50">{layer.desc}</p>
                </div>
              </Card>
              {i < LAYERS.length - 1 && (
                <div className="h-6 w-px bg-line-light dark:bg-line-dark" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
