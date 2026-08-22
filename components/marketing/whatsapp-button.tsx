import Link from "next/link";
import Image from "next/image";
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
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 block size-16 overflow-hidden rounded-[22%] bg-white shadow-[0_12px_34px_rgba(37,211,102,0.38)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <Image
        src="/whatsapp-icon.webp"
        alt=""
        fill
        sizes="64px"
        className="object-cover"
        priority={false}
      />
    </Link>
  );
}
