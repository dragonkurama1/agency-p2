import { processSteps } from "@/lib/seed-data";

export function ProcessSteps() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {processSteps.map((step) => (
        <div key={step.step} className="relative pl-0">
          <span className="font-serif text-5xl text-[var(--border)]">{step.step}</span>
          <h3 className="mt-3 font-medium">{step.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
