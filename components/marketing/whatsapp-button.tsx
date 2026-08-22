import { siteConfig } from "@/lib/site-config";
import { getSetting } from "@/data/settings";
import { WhatsappButtonClient } from "@/components/marketing/whatsapp-button-client";

export async function WhatsappButton() {
  const whatsapp = await getSetting("whatsapp_url", siteConfig.whatsapp);
  if (!whatsapp) return null;
  return <WhatsappButtonClient href={whatsapp} />;
}
