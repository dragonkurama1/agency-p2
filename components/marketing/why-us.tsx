import { ShieldCheck, Gauge, LineChart, Users } from "lucide-react";

const points = [
  { icon: ShieldCheck, title: "Transparence totale", description: "Reporting clair, accès à vos données, pas de boîte noire." },
  { icon: Gauge, title: "Exécution rapide", description: "Des équipes réactives, des délais tenus, pas de bureaucratie." },
  { icon: LineChart, title: "Orienté résultats", description: "Chaque action est mesurée et reliée à un objectif business." },
  { icon: Users, title: "Une équipe, tous les leviers", description: "Stratégie, création, publicité et web sous un même toit." },
];

export function WhyUs() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {points.map((p) => (
        <div key={p.title}>
          <p.icon className="size-7 text-[var(--accent-gold)]" />
          <h3 className="mt-4 font-medium">{p.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
        </div>
      ))}
    </div>
  );
}
