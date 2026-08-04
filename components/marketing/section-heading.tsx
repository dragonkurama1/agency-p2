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
        <p className="text-[11px] font-normal uppercase tracking-[0.35em] text-[var(--accent-gold-text)] mb-4 opacity-90">
          {eyebrow}
        </p>
      )}
      <h2
        className="font-serif leading-tight text-white text-glow"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[var(--muted-foreground)] text-base sm:text-[17px] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
