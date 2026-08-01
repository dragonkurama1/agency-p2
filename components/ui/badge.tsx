import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--accent-gold-text)]",
        className
      )}
      {...props}
    />
  );
}
