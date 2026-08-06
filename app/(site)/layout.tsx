import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";
import { SpaceBackground } from "@/components/layout/space-background";
import Planet from "@/components/marketing/PlanetLazy";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/*
       * <Planet> renders BEFORE <SpaceBackground> so that the stars canvas
       * (inside SpaceBackground, later in DOM) paints in front of the planet.
       * Both use z-index: -1; DOM order decides who wins.
       */}
      <Planet />
      {/* ── Space background (CSS bg) + star particles ─────────── */}
      <SpaceBackground />
      <Header />
      {/* pt-20 compense le header fixed (h-20 = 80px). Le Hero annule ce padding avec -mt-20. */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <WhatsappButton />
    </>
  );
}
