"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import type { EntityConfig } from "@/lib/entities";
import type { ContentState } from "@/actions/content";
import { parseBool } from "@/lib/parse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type BoundAction = (prevState: ContentState, formData: FormData) => Promise<ContentState>;

const initialState: ContentState = { success: false, message: "" };

export function EntityForm({
  config,
  initialValues,
  action,
}: {
  config: EntityConfig;
  initialValues?: Record<string, string>;
  action: BoundAction;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = initialValues ?? {};

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {config.fields
        .filter((field) => field.key !== "id")
        .map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium">
              {field.label}
              {field.required && <span className="text-[var(--accent-gold)]"> *</span>}
            </label>

            {field.type === "boolean" ? (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  id={field.key}
                  name={field.key}
                  type="checkbox"
                  defaultChecked={parseBool(values[field.key])}
                  className="size-4 rounded border-[var(--border)]"
                />
                Actif
              </label>
            ) : field.type === "select" ? (
              <Select id={field.key} name={field.key} defaultValue={values[field.key] ?? ""} required={field.required}>
                <option value="" disabled>
                  Choisir...
                </option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            ) : field.type === "textarea" || field.type === "richtext" || field.type === "json" ? (
              <Textarea
                id={field.key}
                name={field.key}
                defaultValue={values[field.key] ?? ""}
                required={field.required}
                rows={field.type === "richtext" ? 10 : 4}
                className={field.type === "json" ? "font-mono text-xs" : undefined}
                placeholder={field.type === "json" ? '{"exemple": "valeur"}' : undefined}
              />
            ) : (
              <Input
                id={field.key}
                name={field.key}
                type={field.type === "number" ? "number" : field.type === "date" ? "text" : "text"}
                defaultValue={values[field.key] ?? ""}
                required={field.required}
                placeholder={field.type === "image" ? "URL de l'image (voir page Médias)" : undefined}
              />
            )}
          </div>
        ))}

      {state.message && !state.success && (
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
