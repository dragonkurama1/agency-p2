"use client";

import { useActionState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitContactForm, type ContactFormState } from "@/actions/leads";

const initialState: ContactFormState = { success: false, message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="source_page" value="/contact" />
      {/* Honeypot anti-spam — champ caché, jamais rempli par un humain */}
      <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Nom complet *</Label>
          <Input id="name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="company">Entreprise</Label>
          <Input id="company" name="company" className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Votre message *</Label>
        <Textarea id="message" name="message" required rows={5} className="mt-1.5" />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Envoyer le message
      </Button>

      {state.message && (
        <p
          className={`flex items-center gap-2 text-sm ${
            state.success ? "text-green-500" : "text-red-500"
          }`}
          role="status"
        >
          {state.success ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
          {state.message}
        </p>
      )}
    </form>
  );
}
