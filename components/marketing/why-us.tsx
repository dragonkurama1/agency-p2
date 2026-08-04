import { ShieldCheck, Gauge, LineChart, Users } from "lucide-react";

const points = [
  {
    icon: ShieldCheck,
    title: "Transparence totale",
    description: "Reporting clair, accès à vos données, pas de boîte noire.",
  },
  {
    icon: Gauge,
    title: "Exécution rapide",
    description: "Des équipes réactives, des délais tenus, pas de bureaucratie.",
  },
  {
    icon: LineChart,
    title: "Orienté résultats",
    description: "Chaque action est mesurée et reliée à un objectif business.",
  },
  {
    icon: Users,
    title: "Une équipe, tous les leviers",
    description: "Stratégie, création, publicité et web sous un même toit.",
  },
];

export function WhyUs() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {points.map((p) => (
        <div
          key={p.title}
          className="glass-card p-6 rounded-2xl group relative overflow-hidden"
        >
          {/* Glow corner */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: "radial-gradient(circle at top right, rgba(124,58,237,0.15), transparent 70%)",
            }}
          />

          {/* Icône */}
          <div
            className="inline-flex items-center justify-center size-11 rounded-xl mb-5 float"
            style={{
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <p.icon className="size-5 text-[var(--accent-gold)] icon-halo" />
          </div>

          <h3 className="font-serif text-xl uppercase text-white mb-2">{p.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{p.description}</p>
        </div>
      ))}
    </div>
  );
}
