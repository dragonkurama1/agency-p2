"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

// ── Contact ──────────────────────────────────────────────────────────────────

const contactSchema = z.object({
  name:        z.string().min(2, "Veuillez indiquer votre nom."),
  email:       z.string().email("Adresse email invalide."),
  phone:       z.string().optional().default(""),
  company:     z.string().optional().default(""),
  message:     z.string().optional().default(""),
  source_page: z.string().optional().default("/contact"),
  website_url: z.string().optional().default(""), // honeypot
});

export type ContactFormState = { success: boolean; message: string };

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const s = (key: string) => (formData.get(key) as string | null) ?? "";

  const parsed = contactSchema.safeParse({
    name:        s("name"),
    email:       s("email"),
    phone:       s("phone"),
    company:     s("company"),
    message:     s("message"),
    source_page: s("source_page"),
    website_url: s("website_url"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire." };
  }

  const { website_url, ...data } = parsed.data;
  // Honeypot : si rempli → bot, on simule le succès sans insérer
  if (website_url) return { success: true, message: "Merci, votre message a été envoyé." };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads_contact").insert({
      ...data,
      status: "Nouveau",
      notes: "",
    });
    if (error) throw error;
    return { success: true, message: "Merci, votre message a été envoyé. Nous vous répondons rapidement." };
  } catch (err) {
    console.error("submitContactForm", err);
    return { success: false, message: "Une erreur est survenue. Contactez-nous par WhatsApp." };
  }
}

// ── Devis ────────────────────────────────────────────────────────────────────

const devisSchema = z.object({
  name:                z.string().min(2, "Veuillez indiquer votre nom."),
  email:               z.string().email("Adresse email invalide."),
  phone:               z.string().optional().default(""),
  company:             z.string().optional().default(""),
  city:                z.string().optional().default(""),
  website:             z.string().optional().default(""),
  social_links:        z.string().optional().default(""),
  selected_services:   z.string().optional().default(""),
  budget:              z.string().optional().default(""),
  timeline:            z.string().optional().default(""),
  objective:           z.string().optional().default(""),
  project_description: z.string().optional().default(""),
  website_url:         z.string().optional().default(""), // honeypot
});

export type DevisFormState = { success: boolean; message: string };

export async function submitDevisForm(
  _prev: DevisFormState,
  formData: FormData
): Promise<DevisFormState> {
  // Convertit null → "" pour les champs absents du DOM (étapes masquées)
  const s = (key: string) => (formData.get(key) as string | null) ?? "";

  const parsed = devisSchema.safeParse({
    name:                s("name"),
    email:               s("email"),
    phone:               s("phone"),
    company:             s("company"),
    city:                s("city"),
    website:             s("website"),
    social_links:        s("social_links"),
    selected_services:   s("selected_services"),
    budget:              s("budget"),
    timeline:            s("timeline"),
    objective:           s("objective"),
    project_description: s("project_description"),
    website_url:         s("website_url"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire." };
  }

  const { website_url, ...data } = parsed.data;
  if (website_url) return { success: true, message: "Merci, votre demande a été envoyée." };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads_devis").insert({
      ...data,
      file_url: "",
      status: "Nouveau",
      notes: "",
    });
    if (error) throw error;
    return { success: true, message: "Merci ! Votre demande de devis a été envoyée. Nous vous recontactons sous 24h." };
  } catch (err) {
    console.error("submitDevisForm", err);
    return { success: false, message: "Une erreur est survenue. Contactez-nous par WhatsApp." };
  }
}
