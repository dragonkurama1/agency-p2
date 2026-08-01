"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitDevisForm } from "@/actions/leads";
import type { Service } from "@/lib/seed-data";

const STEPS = ["Coordonnées", "Présence actuelle", "Votre projet", "Description"];

type FieldErrors = Record<string, string>;
type Result = { success: boolean; message: string } | null;

const emptyValues = {
  name: "", company: "", phone: "", email: "", city: "",
  website: "", social_links: "",
  budget: "", timeline: "",
  objective: "", project_description: "",
};

export function DevisForm({ services }: { services: Service[] }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(emptyValues);
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<Result>(null);
  const [isPending, startTransition] = useTransition();

  const set = (key: keyof typeof emptyValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  function toggleService(title: string) {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  }

  function validateStep0(): FieldErrors {
    const e: FieldErrors = {};
    if (values.name.trim().length < 2)
      e.name = "Veuillez indiquer votre nom (2 caractères minimum).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      e.email = "Adresse email invalide.";
    if (values.phone.trim().length < 6)
      e.phone = "Numéro de téléphone invalide.";
    return e;
  }

  function handleNext() {
    if (step === 0) {
      const e = validateStep0();
      if (Object.keys(e).length > 0) { setErrors(e); return; }
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit() {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    fd.append("selected_services", selected.join(", "));
    fd.append("website_url", ""); // honeypot vide

    startTransition(async () => {
      const res = await submitDevisForm({ success: false, message: "" }, fd);
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-[var(--accent-gold)]" />
        <p className="mt-4 text-lg">{result.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[11px]",
                i <= step
                  ? "border-[var(--accent-gold)] text-[var(--accent-gold)]"
                  : "border-[var(--border)]"
              )}
            >
              {i + 1}
            </span>
            <span className={cn(i === step && "text-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      {/* ── Étape 1 : Coordonnées ── */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name" value={values.name} onChange={set("name")}
                className={cn("mt-1.5", errors.name && "border-red-500")}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="company">Entreprise</Label>
              <Input id="company" value={values.company} onChange={set("company")} className="mt-1.5" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone" value={values.phone} onChange={set("phone")}
                className={cn("mt-1.5", errors.phone && "border-red-500")}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email" type="email" value={values.email} onChange={set("email")}
                className={cn("mt-1.5", errors.email && "border-red-500")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" value={values.city} onChange={set("city")} placeholder="Casablanca" className="mt-1.5" />
          </div>
        </div>
      )}

      {/* ── Étape 2 : Présence actuelle ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="website">Site web actuel</Label>
            <Input id="website" value={values.website} onChange={set("website")} placeholder="https://" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="social_links">Réseaux sociaux</Label>
            <Input id="social_links" value={values.social_links} onChange={set("social_links")} placeholder="Instagram, LinkedIn..." className="mt-1.5" />
          </div>
        </div>
      )}

      {/* ── Étape 3 : Votre projet ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <Label>Services souhaités</Label>
            <div className="mt-2 grid sm:grid-cols-2 gap-2">
              {services.map((s) => (
                <button
                  type="button"
                  key={s.slug}
                  onClick={() => toggleService(s.title)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    selected.includes(s.title)
                      ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10"
                      : "border-[var(--border)] hover:border-[var(--accent-gold)]"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="budget">Budget approximatif</Label>
              <Select id="budget" value={values.budget} onChange={set("budget")} className="mt-1.5">
                <option value="">Sélectionner</option>
                <option value="< 5 000 MAD">Moins de 5 000 MAD</option>
                <option value="5 000 - 15 000 MAD">5 000 - 15 000 MAD</option>
                <option value="15 000 - 40 000 MAD">15 000 - 40 000 MAD</option>
                <option value="> 40 000 MAD">Plus de 40 000 MAD</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeline">Lancement souhaité</Label>
              <Select id="timeline" value={values.timeline} onChange={set("timeline")} className="mt-1.5">
                <option value="">Sélectionner</option>
                <option value="Dès que possible">Dès que possible</option>
                <option value="Dans le mois">Dans le mois</option>
                <option value="Dans les 3 mois">Dans les 3 mois</option>
                <option value="Pas encore décidé">Pas encore décidé</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Description ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <Label htmlFor="objective">Objectif principal</Label>
            <Input
              id="objective"
              value={values.objective}
              onChange={set("objective")}
              placeholder="Ex: augmenter mes ventes en ligne"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="project_description">Décrivez votre projet</Label>
            <Textarea
              id="project_description"
              value={values.project_description}
              onChange={set("project_description")}
              rows={5}
              className="mt-1.5"
              placeholder="Décrivez votre projet, vos besoins, vos attentes..."
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
          <ArrowLeft className="size-4" /> Précédent
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Suivant <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Envoyer ma demande
          </Button>
        )}
      </div>

      {result && !result.success && (
        <p className="flex items-center gap-2 text-sm text-red-500" role="alert">
          <AlertCircle className="size-4" />
          {result.message}
        </p>
      )}
    </div>
  );
}
