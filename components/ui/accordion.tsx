"use client";
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "glass-card rounded-xl overflow-hidden transition-all duration-300",
            open === i && "border-[rgba(124,58,237,0.35)]"
          )}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between text-left px-6 py-5 group"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-white text-base pr-4 group-hover:text-[var(--accent-gold-text)] transition-colors duration-200">
              {item.question}
            </span>
            <ChevronDown
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300",
                open === i
                  ? "rotate-180 text-[var(--accent-gold)]"
                  : "text-[var(--muted-foreground)]"
              )}
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-400",
              open === i ? "max-h-96" : "max-h-0"
            )}
          >
            <div className="px-6 pb-5">
              <div
                className="h-px mb-4"
                style={{
                  background: "linear-gradient(to right, rgba(124,58,237,0.3), transparent)",
                }}
              />
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
