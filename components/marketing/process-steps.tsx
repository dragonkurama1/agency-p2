import { processSteps } from "@/lib/seed-data";

export function ProcessSteps() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {processSteps.map((step, index) => (
        <div
          key={step.step}
          className="glass-card relative p-6 rounded-2xl overflow-hidden group"
        >
          {/* Numéro en filigrane */}
          <div
            aria-hidden="true"
            className="absolute -right-3 -top-4 font-serif text-[5.5rem] leading-none font-black pointer-events-none select-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
            style={{ color: "var(--accent-gold)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </div>

          {/* Indicateur d'étape */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--accent-gold), #5b21b6)",
                boxShadow: "0 0 16px rgb(var(--accent-gold-rgb) / 0.45)",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            {/* Connecteur (sauf dernier) */}
            {index < processSteps.length - 1 && (
              <div
                className="hidden lg:block h-px flex-1"
                style={{
                  background: "linear-gradient(to right, rgb(var(--accent-gold-rgb) / 0.5), transparent)",
                }}
              />
            )}
          </div>

          <h3 className="font-serif text-xl uppercase text-white mb-2">{step.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
