import { Navbar, Hero } from "@/components/sections/NavbarSection";
import { About, ChatDemo, FAQ } from "@/components/sections/ContentSections";
import { CTA, Contacts, Footer } from "@/components/sections/CtaFooter";

type Props = {
  onStart: () => void;
  onGame: () => void;
  onAnalysis: () => void;
  onAuth: () => void;
  onPayment: () => void;
  onProfile: () => void;
  lessonsLeft: number | null;
  gamesLeft: number | null;
  isPaid: boolean;
};

export default function LandingLayout({ onStart, onGame, onAnalysis, onAuth, onPayment, onProfile, lessonsLeft, gamesLeft, isPaid }: Props) {
  return (
    <>
      <Navbar onStart={onStart} onAuth={onAuth} onPayment={onPayment} onProfile={onProfile} />
      <Hero onStart={onStart} onGame={onGame} onAnalysis={onAnalysis} onPayment={onPayment} lessonsLeft={lessonsLeft} gamesLeft={gamesLeft} isPaid={isPaid} />
      <About />
      <ChatDemo onPayment={onPayment} />
      <FAQ />
      <CTA onStart={onStart} />
      <Contacts />
      <Footer />
    </>
  );
}