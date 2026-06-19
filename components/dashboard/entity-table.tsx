import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { EntityConfig } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { CsvExportButton } from "@/components/dashboard/csv-export-button";
import { parseBool } from "@/lib/parse";

function truncate(value: string, max = 60) {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export function EntityTable({ entityKey, config, rows }: { entityKey: string; config: EntityConfig; rows: Record<string, string>[] }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">{config.label}</h1>
          {config.description && <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <CsvExportButton rows={rows} columns={config.fields.map((f) => f.key)} filename={config.tab} />
          <Link href={`/dashboard/${entityKey}/new`}>
            <Button size="sm">
              <Plus className="size-4" />
              Nouveau
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--muted)] text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {config.listColumns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium">
                  {config.fields.find((f) => f.key === col)?.label ?? col}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={config.listColumns.length + 1} className="px-4 py-10 text-center text-muted-foreground">
                  Aucune donnée. Connectez Google Sheets ou ajoutez une ligne.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--border)]">
                {config.listColumns.map((col) => {
                  const field = config.fields.find((f) => f.key === col);
                  const value = row[col] ?? "";
                  return (
                    <td key={col} className="px-4 py-3">
                      {field?.type === "boolean" ? (
                        <Badge className={parseBool(value, false) ? "" : "border-[var(--border)] bg-transparent text-muted-foreground"}>
                          {parseBool(value, false) ? "Actif" : "Inactif"}
                        </Badge>
                      ) : (
                        truncate(value)
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/${entityKey}/${row.id}`}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-[var(--accent-gold)]"
                      title="Modifier"
                    >
                      <Pencil className="size-4" />
                    </Link>
                    <DeleteButton entityKey={entityKey} id={row.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
