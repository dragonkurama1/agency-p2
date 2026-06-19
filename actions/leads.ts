"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { appendSheetRow, isGoogleSheetsConfigured } from "@/lib/google/sheets";
import { entities } from "@/lib/entities";

/**
 * Server Actions pour les formulaires Contact et Devis.
 * - Validation Zod côté serveur (ne jamais faire confiance au client)
 * - Honeypot anti-spam : champ caché `website_url` qui ne doit jamais être rempli par un humain
 * - Écrit dans Google Sheets si configuré, sinon log en console (mode démo)
 * - Ne renvoie jamais d'erreur technique brute au client : messages propres en français
 */

const contactSchema = z.object({
  name: z.string().min(2, "Veuillez indiquer votre nom."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().optional().default(""),
  company: z.string().optional().default(""),
  message: z.string().min(10, "Votre message est trop court."),
  source_page: z.string().optional().default("/contact"),
  website_url: z.string().max(0, "Spam détecté.").optional().default(""), // honeypot
});

export type ContactFormState = { success: boolean; message: string };

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
    source_page: formData.get("source_page"),
    website_url: formData.get("website_url"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Veuillez vérifier les champs du formulaire." };
  }

  const { website_url, ...data } = parsed.data;
  if (website_url) {
    // Honeypot rempli : on répond succès (ne pas alerter le bot) mais on n'enregistre rien.
    return { success: true, message: "Merci, votre message a été envoyé." };
  }

  const row = {
    id: randomUUID(),
    ...data,
    status: "Nouveau",
    notes: "",
    created_at: new Date().toISOString(),
  };

  try {
    if (isGoogleSheetsConfigured()) {
      const columns = entities.leads_contact.fields.map((f) => f.key);
      await appendSheetRow("leads_contact", columns, row);
    } else {
      console.log("[devis-form:demo] Google Sheets non configuré — lead non persisté :", row);
    }
    return { success: true, message: "Merci, votre message a été envoyé. Nous vous répondons rapidement." };
  } catch (err) {
    console.error("submitContactForm error", err);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer ou de nous contacter par WhatsApp." };
  }
}

const devisSchema = z.object({
  name: z.string().min(2, "Veuillez indiquer votre nom."),
  company: z.string().optional().default(""),
  phone: z.string().min(6, "Numéro de téléphone invalide."),
  email: z.string().email("Adresse email invalide."),
  city: z.string().optional().default(""),
  website: z.string().optional().default(""),
  social_links: z.string().optional().default(""),
  selected_services: z.string().min(1, "Sélectionnez au moins un service."),
  budget: z.string().optional().default(""),
  timeline: z.string().optional().default(""),
  objective: z.string().optional().default(""),
  project_description: z.string().min(10, "Merci de décrire votre projet en quelques mots."),
  website_url: z.string().max(0).optional().default(""), // honeypot
});

export type DevisFormState = { success: boolean; message: string };

export async function submitDevisForm(
  _prev: DevisFormState,
  formData: FormData
): Promise<DevisFormState> {
  const parsed = devisSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    city: formData.get("city"),
    website: formData.get("website"),
    social_links: formData.get("social_links"),
    selected_services: formData.get("selected_services"),
    budget: formData.get("budget"),
    timeline: formData.get("timeline"),
    objective: formData.get("objective"),
    project_description: formData.get("project_description"),
    website_url: formData.get("website_url"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Veuillez vérifier les champs du formulaire." };
  }

  const { website_url, ...data } = parsed.data;
  if (website_url) {
    return { success: true, message: "Merci, votre demande a été envoyée." };
  }

  const row = {
    id: randomUUID(),
    ...data,
    file_url: "",
    status: "Nouveau",
    notes: "",
    created_at: new Date().toISOString(),
  };

  try {
    if (isGoogleSheetsConfigured()) {
      const columns = entities.leads_devis.fields.map((f) => f.key);
      await appendSheetRow("leads_devis", columns, row);
    } else {
      console.log("[devis-form:demo] Google Sheets non configuré — lead non persisté :", row);
    }
    return { success: true, message: "Merci ! Votre demande de devis a été envoyée. Nous vous recontactons sous 24h." };
  } catch (err) {
    console.error("submitDevisForm error", err);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer ou de nous contacter par WhatsApp." };
  }
}
