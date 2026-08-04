import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBanner({
  title = "Prêt à transformer votre présence digitale ?",
  subtitle = "Discutons de votre projet et construisons ensemble une stratégie qui convertit.",
  href = "/devis",
  cta = "Demander un devis gratuit",
}: {
  title?: string;
  subtitle?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Lueurs cosmiques de fond */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.18) 0%, transparent 65%)," +
            "radial-gradient(ellipse at 80% 100%, rgba(79,70,229,0.12) 0%, transparent 55%)",
        }}
      />

      {/* Panel glass centré */}
      <div className="container-px mx-auto max-w-4xl text-center relative z-10">
        <div
          className="glass-dark rounded-3xl py-16 px-8 sm:px-16 relative overflow-hidden"
          style={{ border: "1px solid rgba(124,58,237,0.25)" }}
        >
          {/* Anneau décoratif */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          <h2
            className="font-serif uppercase text-white text-glow mx-auto"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", maxWidth: "36rem" }}
          >
            {title}
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)] max-w-xl mx-auto text-[16px] leading-relaxed">
            {subtitle}
          </p>
          <Link
            href={href}
            className="group mt-10 inline-flex items-center gap-2 rounded-full text-white font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
              padding: "14px 36px",
              fontSize: "15px",
              boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 60px rgba(124,58,237,0.65), 0 8px 32px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 30px rgba(124,58,237,0.4), 0 4px 24px rgba(0,0,0,0.3)";
            }}
          >
            {cta}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
