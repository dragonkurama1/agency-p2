import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { getSetting } from "@/data/settings";

export async function WhatsappButton() {
  const whatsapp = await getSetting("whatsapp_url", siteConfig.whatsapp);
  if (!whatsapp) return null;
  return (
    <Link
      href={whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter Prestigia Agency sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" />
    </Link>
  );
}
