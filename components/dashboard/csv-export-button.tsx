"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

function toCsvValue(value: unknown) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function CsvExportButton({ rows, columns, filename }: { rows: Record<string, string>[]; columns: string[]; filename: string }) {
  function handleExport() {
    const header = columns.join(",");
    const lines = rows.map((row) => columns.map((col) => toCsvValue(row[col])).join(","));
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={rows.length === 0}>
      <Download className="size-4" />
      Exporter CSV
    </Button>
  );
}
