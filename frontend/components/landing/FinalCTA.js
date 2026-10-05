import Link from "next/link";
import Button from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="py-28">
      <div className="container-shell">
        <div className="relative overflow-hidden rounded-3xl bg-signal-gradient px-8 py-16 text-center text-white sm:px-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Turn candidate data into hiring intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            The final hiring decision always stays with your team. HireMind AI
            just makes sure you have the full picture before you make it.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              as={Link}
              href="/register?role=candidate"
              variant="secondary"
              size="lg"
              className="bg-white text-[#12162B] hover:bg-white/90"
            >
              Start as Candidate
            </Button>
            <Button
              as={Link}
              href="/register?role=recruiter"
              variant="outline"
              size="lg"
              className="border-white/40 text-white hover:bg-white/10"
            >
              Start Hiring
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
