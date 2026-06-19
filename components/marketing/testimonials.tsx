import { Star } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((t) => (
        <figure key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6">
          <div className="flex gap-1">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="size-4 fill-[var(--accent-gold)] text-[var(--accent-gold)]" />
            ))}
          </div>
          <blockquote className="mt-4 text-sm leading-relaxed">&laquo; {t.message} &raquo;</blockquote>
          <figcaption className="mt-4 text-sm font-medium">
            {t.client_name}
            {t.company && <span className="text-muted-foreground"> — {t.company}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
