import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* pt-20 compense le header fixed (h-20 = 80px). Le Hero annule ce padding avec -mt-20. */}
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
      <WhatsappButton />
    </>
  );
}
