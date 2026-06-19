"use client";

import { useActionState, useRef } from "react";
import { AlertCircle, CheckCircle2, UploadCloud } from "lucide-react";
import { uploadMedia, type MediaState } from "@/actions/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: MediaState = { success: false, message: "" };

export function MediaUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(async (prev: MediaState, formData: FormData) => {
    const result = await uploadMedia(prev, formData);
    if (result.success) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-4 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="file" className="mb-1.5 block text-sm font-medium">
          Fichier
        </label>
        <input
          id="file"
          name="file"
          type="file"
          required
          className="w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-gold)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#0a0a0b]"
        />
      </div>
      <div className="w-40">
        <label htmlFor="folder" className="mb-1.5 block text-sm font-medium">
          Dossier
        </label>
        <Input id="folder" name="folder" placeholder="services, blog..." defaultValue="general" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="alt_text" className="mb-1.5 block text-sm font-medium">
          Texte alternatif
        </label>
        <Input id="alt_text" name="alt_text" placeholder="Description de l'image (SEO)" />
      </div>
      <Button type="submit" disabled={pending}>
        <UploadCloud className="size-4" />
        {pending ? "Envoi..." : "Envoyer"}
      </Button>

      {state.message && (
        <p className={`flex items-center gap-2 text-sm ${state.success ? "text-emerald-500" : "text-red-500"} w-full`}>
          {state.success ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          {state.message}
        </p>
      )}
    </form>
  );
}
