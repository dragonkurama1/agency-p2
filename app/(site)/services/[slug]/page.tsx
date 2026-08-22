import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { getServices, getServiceBySlug } from "@/data/services";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { FaqSection } from "@/components/marketing/faq-section";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { ServiceJsonLd, FaqJsonLd, WebPageJsonLd } from "@/components/seo/json-ld";
import { cleanMetaTitle } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const title = cleanMetaTitle(service.meta_title || service.title);
  return {
    title,
    description: service.meta_description || service.short_description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title,
      description: service.meta_description || service.short_description,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [service, allServices] = await Promise.all([getServiceBySlug(slug), getServices()]);
  if (!service) notFound();

  const Icon = getIcon(service.icon);
  const related = allServices.filter((s) => service.related.includes(s.slug));

  return (
    <>
      <WebPageJsonLd
        title={service.meta_title || service.title}
        description={service.meta_description || service.short_description}
        path={`/services/${slug}`}
        breadcrumbs={[
          { name: "Services", href: "/services" },
          { name: service.title, href: `/services/${slug}` },
        ]}
      />
      <ServiceJsonLd
        name={service.title}
        description={service.meta_description || service.short_description}
        slug={service.slug}
      />
      {service.faq.length > 0 && <FaqJsonLd items={service.faq} />}

      <section className="container-px mx-auto max-w-4xl py-20">
        <nav aria-label="Fil d'Ariane">
          <Link href="/services" className="text-sm text-muted-foreground hover:text-[var(--accent-gold)]">
            ← Tous les services
          </Link>
        </nav>
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="mt-6 size-10 text-[var(--accent-gold)]" aria-hidden="true" />
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl leading-tight">{service.title}</h1>
        <p className="mt-5 text-lg text-muted-foreground">{service.full_description}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/devis">
            Demander un devis <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>

      {service.advantages.length > 0 && (
        <section className="section-light py-16" aria-label="Avantages">
          <div className="container-px mx-auto max-w-4xl">
            <h2 className="font-serif text-2xl mb-8">Les avantages</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {service.advantages.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--accent-gold)]" aria-hidden="true" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {service.process.length > 0 && (
        <section className="container-px mx-auto max-w-4xl py-16" aria-label="Notre processus">
          <h2 className="font-serif text-2xl mb-8">Notre processus</h2>
          <ol className="grid sm:grid-cols-2 gap-6">
            {service.process.map((step, i) => (
              <li key={step} className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5">
                <span className="font-serif text-2xl text-[var(--accent-gold)]" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {service.faq.length > 0 && (
        <section className="section-light py-16" aria-label="Questions fréquentes">
          <div className="container-px mx-auto max-w-3xl">
            <h2 className="font-serif text-2xl mb-8">Questions fréquentes</h2>
            <FaqSection items={service.faq} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container-px mx-auto max-w-4xl py-16" aria-label="Services complémentaires">
          <h2 className="font-serif text-2xl mb-8">Services complémentaires</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/services/${r.slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-5 hover:border-[var(--accent-gold)]"
              >
                <p className="font-medium">{r.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{r.short_description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CtaBanner />
    </>
  );
}
