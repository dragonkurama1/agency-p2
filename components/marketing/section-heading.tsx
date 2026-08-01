import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-gold-text)] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-base sm:text-lg">{subtitle}</p>}
    </div>
  );
}
