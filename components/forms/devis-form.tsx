"use client";

import { useActionState, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { submitDevisForm, type DevisFormState } from "@/actions/leads";
import type { Service } from "@/lib/seed-data";

const initialState: DevisFormState = { success: false, message: "" };
const STEPS = ["Coordonnées", "Présence actuelle", "Votre projet", "Description"];

export function DevisForm({ services }: { services: Service[] }) {
  const [state, formAction, pending] = useActionState(submitDevisForm, initialState);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function toggleService(title: string) {
    setSelected((prev) => (prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]));
  }

  if (state.success) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-[var(--accent-gold)]" />
        <p className="mt-4 text-lg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="text" name="website_url" className="hidden" tabIndex={-1} autoComplete="off" />
      <input type="hidden" name="selected_services" value={selected.join(", ")} />

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[11px]",
                i <= step ? "border-[var(--accent-gold)] text-[var(--accent-gold)]" : "border-[var(--border)]"
              )}
            >
              {i + 1}
            </span>
            <span className={cn(i === step && "text-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-[var(--border)]" />}
          </div>
        ))}
      </div>

      {/* Étape 1 */}
      <div className={cn("space-y-5", step !== 0 && "hidden")}>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input id="name" name="name" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input id="company" name="company" className="mt-1.5" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input id="phone" name="phone" required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required className="mt-1.5" />
          </div>
        </div>
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" placeholder="Casablanca" className="mt-1.5" />
        </div>
      </div>

      {/* Étape 2 */}
      <div className={cn("space-y-5", step !== 1 && "hidden")}>
        <div>
          <Label htmlFor="website">Site web actuel</Label>
          <Input id="website" name="website" placeholder="https://" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="social_links">Réseaux sociaux</Label>
          <Input id="social_links" name="social_links" placeholder="Instagram, LinkedIn..." className="mt-1.5" />
        </div>
      </div>

      {/* Étape 3 */}
      <div className={cn("space-y-5", step !== 2 && "hidden")}>
        <div>
          <Label>Services souhaités *</Label>
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
            <Select id="budget" name="budget" className="mt-1.5">
              <option value="">Sélectionner</option>
              <option value="< 5 000 MAD">Moins de 5 000 MAD</option>
              <option value="5 000 - 15 000 MAD">5 000 - 15 000 MAD</option>
              <option value="15 000 - 40 000 MAD">15 000 - 40 000 MAD</option>
              <option value="> 40 000 MAD">Plus de 40 000 MAD</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="timeline">Lancement souhaité</Label>
            <Select id="timeline" name="timeline" className="mt-1.5">
              <option value="">Sélectionner</option>
              <option value="Dès que possible">Dès que possible</option>
              <option value="Dans le mois">Dans le mois</option>
              <option value="Dans les 3 mois">Dans les 3 mois</option>
              <option value="Pas encore décidé">Pas encore décidé</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Étape 4 */}
      <div className={cn("space-y-5", step !== 3 && "hidden")}>
        <div>
          <Label htmlFor="objective">Objectif principal</Label>
          <Input id="objective" name="objective" placeholder="Ex: augmenter mes ventes en ligne" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="project_description">Décrivez votre projet *</Label>
          <Textarea id="project_description" name="project_description" required rows={5} className="mt-1.5" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
          <ArrowLeft className="size-4" /> Précédent
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Suivant <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            Envoyer ma demande
          </Button>
        )}
      </div>

      {state.message && !state.success && (
        <p className="flex items-center gap-2 text-sm text-red-500" role="status">
          <AlertCircle className="size-4" />
          {state.message}
        </p>
      )}
    </form>
  );
}
