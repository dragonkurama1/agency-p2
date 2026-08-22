import { cn } from "@/lib/utils";

export function SectionHeading({
  as = "h2",
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  as?: "h1" | "h2" | "h3";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const HeadingTag = as;

  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-[11px] font-normal uppercase tracking-[0.35em] text-[var(--accent-gold-text)] mb-4 opacity-90">
          {eyebrow}
        </p>
      )}
      <HeadingTag
        className={cn(
          "font-serif leading-tight text-white text-glow",
          as === "h1"
            ? "text-[clamp(2.7rem,5.2vw,4.6rem)] leading-none"
            : "text-[clamp(2rem,4vw,3rem)]",
        )}
      >
        {title}
      </HeadingTag>
      {subtitle && (
        <p className="mt-4 text-[var(--muted-foreground)] text-base sm:text-[17px] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
