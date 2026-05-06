import { Navbar, Hero } from "@/components/sections/NavbarSection";
import { About, ChatDemo, FAQ, Articles } from "@/components/sections/ContentSections";
import { CTA, Contacts, Footer } from "@/components/sections/CtaFooter";

export default function LandingLayout({ onStart, onGame, onAuth }: { onStart: () => void; onGame: () => void; onAuth: () => void }) {
  return (
    <>
      <Navbar onStart={onStart} onAuth={onAuth} />
      <Hero onStart={onStart} onGame={onGame} />
      <About />
      <ChatDemo />
      <FAQ />
      <Articles />
      <CTA onStart={onStart} />
      <Contacts />
      <Footer />
    </>
  );
}