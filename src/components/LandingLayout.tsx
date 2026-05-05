import { Navbar, Hero } from "@/components/sections/NavbarSection";
import { About, ChatDemo, FAQ, Articles } from "@/components/sections/ContentSections";
import { CTA, Contacts, Footer } from "@/components/sections/CtaFooter";

export default function LandingLayout({ onStart, onAuth }: { onStart: () => void; onAuth: () => void }) {
  return (
    <>
      <Navbar onStart={onStart} onAuth={onAuth} />
      <Hero onStart={onStart} />
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
