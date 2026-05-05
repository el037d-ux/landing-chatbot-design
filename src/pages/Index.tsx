import { useState, useEffect } from "react";
import LandingLayout from "@/components/LandingLayout";
import LessonWizard from "@/components/LessonWizard";
import AuthModal from "@/components/AuthModal";

function useSectionFade() {
  useEffect(() => {
    const els = document.querySelectorAll(".section-fade");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Index() {
  useSectionFade();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {wizardOpen && <LessonWizard onClose={() => setWizardOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      <LandingLayout onStart={() => setWizardOpen(true)} onAuth={() => setAuthOpen(true)} />
    </div>
  );
}
