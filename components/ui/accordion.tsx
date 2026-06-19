"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((item, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="font-serif text-lg text-[var(--foreground)]">{item.question}</span>
            <ChevronDown
              className={cn("h-5 w-5 shrink-0 text-[var(--accent-gold)] transition-transform", open === i && "rotate-180")}
            />
          </button>
          {open === i && (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted-foreground)]">{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
