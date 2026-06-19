import { siteConfig } from "@/lib/site-config";

export function StatsBar() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--muted)]">
      <div className="container-px mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-8 py-12">
        {siteConfig.stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-3xl sm:text-4xl text-[var(--accent-gold)]">{stat.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
