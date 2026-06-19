"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEntityRow } from "@/actions/content";

export function DeleteButton({ entityKey, id }: { entityKey: string; id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer cette ligne ? Cette action est irréversible.")) return;
        startTransition(async () => {
          await deleteEntityRow(entityKey, id);
        });
      }}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-50"
      title="Supprimer"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
