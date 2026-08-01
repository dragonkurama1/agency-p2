import Image from "next/image";
import { Star } from "lucide-react";
import type { Testimonial } from "@/data/testimonials";
import { normalizeImageUrl } from "@/lib/parse";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((t) => (
        <figure key={t.id} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 flex flex-col">
          <div className="flex gap-1">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="size-4 fill-[var(--accent-gold)] text-[var(--accent-gold)]" />
            ))}
          </div>
          <blockquote className="mt-4 text-sm leading-relaxed flex-1">&laquo; {t.message} &raquo;</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            {t.photo_url ? (
              <Image
                src={normalizeImageUrl(t.photo_url)}
                alt={`Photo de ${t.client_name}`}
                width={40}
                height={40}
                className="size-10 rounded-full object-cover flex-shrink-0 ring-2 ring-[var(--accent-gold)]/30"
              />
            ) : (
              <div className="size-10 rounded-full bg-[var(--accent-gold)]/20 flex-shrink-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-[var(--accent-gold)]">
                  {t.client_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">{t.client_name}</p>
              {t.company && <p className="text-xs text-muted-foreground">{t.company}</p>}
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
