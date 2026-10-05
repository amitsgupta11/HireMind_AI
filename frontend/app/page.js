import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import IntelligenceFormula from "@/components/landing/IntelligenceFormula";
import ExplainableAI from "@/components/landing/ExplainableAI";
import RecruiterPreview from "@/components/landing/RecruiterPreview";
import CandidatePreview from "@/components/landing/CandidatePreview";
import AIInterviewSection from "@/components/landing/AIInterviewSection";
import ArchitectureSection from "@/components/landing/ArchitectureSection";
import FinalCTA from "@/components/landing/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ArchitectureSection />
        <HowItWorks />
        <IntelligenceFormula />
        <ExplainableAI />
        <RecruiterPreview />
        <CandidatePreview />
        <AIInterviewSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
