import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";
import { SpaceBackground } from "@/components/layout/space-background";
import { PrestigiaScene } from "@/components/marketing/prestigia-scene";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrestigiaScene />
      {/* Space background (CSS image) + light star particles */}
      <SpaceBackground />
      <Header />
      {/* pt-20 compense le header fixed (h-20 = 80px). Le Hero annule ce padding avec -mt-20. */}
      <main className="relative z-10 flex-1 pt-20">{children}</main>
      <div className="relative z-10">
        <Footer />
      </div>
      <WhatsappButton />
    </>
  );
}
