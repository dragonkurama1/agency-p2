import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section className="border-t border-[var(--border)] bg-[var(--accent-blue)]">
      <div className="container-px mx-auto max-w-7xl py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-white max-w-2xl mx-auto">{title}</h2>
        <p className="mt-4 text-white/70 max-w-xl mx-auto">{subtitle}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={href}>
            {cta} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
