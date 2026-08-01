/**
 * Google Analytics 4 — implémentation officielle Next.js 2026
 *
 * Utilise next/script avec strategy="afterInteractive" pour ne jamais
 * bloquer le rendu ni impacter les Core Web Vitals (LCP, INP, CLS).
 * Activé uniquement en production (NODE_ENV === "production").
 * Suivi automatique des changements de page App Router via Enhanced Measurement.
 *
 * Variable d'environnement requise :
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */

import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;

  return (
    <>
      {/* Chargement du script gtag.js en différé — n'impacte pas le LCP */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* Initialisation inline — minimal, synchrone après hydratation */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
            anonymize_ip: true,
            allow_google_signals: true,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  );
}
