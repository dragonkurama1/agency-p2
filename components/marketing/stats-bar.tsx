import { siteConfig } from "@/lib/site-config";

export function StatsBar() {
  return (
    <section
      className="relative py-12"
      style={{
        background: "linear-gradient(to right, rgb(var(--accent-gold-rgb) / 0.06), rgba(79,70,229,0.06))",
        borderTop: "1px solid rgb(var(--accent-gold-rgb) / 0.12)",
        borderBottom: "1px solid rgb(var(--accent-gold-rgb) / 0.12)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Lueur de fond */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgb(var(--accent-gold-rgb) / 0.08) 0%, transparent 70%)",
        }}
      />
      <div className="container-px mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-8 relative">
        {siteConfig.stats.map((stat, i) => (
          <div key={stat.label} className="text-center group">
            <p
              className="font-serif text-3xl sm:text-4xl text-glow"
              style={{
                color: "var(--accent-gold-text)",
                textShadow: "0 0 30px rgb(var(--accent-gold-rgb) / 0.5)",
              }}
            >
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
