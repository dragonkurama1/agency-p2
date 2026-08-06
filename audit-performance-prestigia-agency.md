# Audit de performance — agency-p2.vercel.app
### Rapport technique complet — Core Web Vitals, chargement, rendu, infrastructure
Préparé le 6 août 2026 — sources : PageSpeed Insights (Lighthouse 13.4.1, rapports mobile `vgbdgtwftx` et bureau `z8q1fwxdg5`), inspection directe du code source.

---

## 0. Résumé exécutif

| Catégorie | Mobile | Bureau |
|---|---|---|
| Performance | **40/100** | **44/100** |
| Accessibilité | 96/100 | 96/100 |
| Bonnes pratiques | 100/100 | 100/100 |
| SEO | 100/100 | 100/100 |
| FCP | 0,9 s | 0,3 s |
| **LCP** | **21,9 s** 🔴 | 3,8 s |
| **TBT** | **28 620 ms** 🔴 | 22 800 ms |
| CLS | 0 | 0 |
| Speed Index | 5,6 s | 2,4 s |
| TTFB serveur | ~3 ms (excellent) | ~3 ms (excellent) |

**Le problème n'est pas votre serveur, votre réseau, ni votre SEO — les trois sont déjà excellents.** Le score Performance s'effondre à cause d'un seul mécanisme récurrent, présent dans presque tous les audits ci-dessous : **le thread principal du navigateur est occupé en continu par du rendu Canvas/WebGL, au point d'empêcher le navigateur de peindre le contenu texte à temps et de traiter les scripts.**

Preuve directe (Lighthouse, audit "Réduisez le travail du thread principal") :

| Catégorie de travail | Mobile | Bureau |
|---|---|---|
| **Other** (compositing, rastérisation Canvas/GPU) | **39 697 ms** | **28 544 ms** |
| Script Evaluation (votre JS applicatif) | 983 ms | 1 122 ms |
| Style & Layout | 92 ms | 141 ms |
| Script Parsing & Compilation | — | 136 ms |
| Garbage Collection | 44 ms | 62 ms |

**96 % du temps de travail du thread principal est classé "Other" — pas du JavaScript métier, du travail de rendu graphique bas niveau.** Ce n'est pas un artefact de mesure : c'est cohérent avec deux boucles `requestAnimationFrame` qui tournent en continu sur chaque page (le fond étoilé en Canvas 2D et la planète 3D en WebGL avec post-traitement bloom), qui sollicitent le compositeur du navigateur à chaque frame, y compris avant et pendant l'hydratation React.

Ce document détaille chaque cause, son impact réel, la correction, le gain estimé et la priorité — puis propose un plan d'action pour dépasser 95/100 mobile et atteindre 100/100 bureau.

> **Note de méthode** : chaque point est marqué **[Observé]** (mesuré directement dans les rapports PSI ou le code), **[Probable]** (déduction technique solide mais non isolée par un test dédié), ou **[À vérifier]** (nécessite un test complémentaire — ex. WebPageTest, profil Chrome DevTools après déploiement du correctif).

---

## 1. Constat n°1 — Rendu Canvas/WebGL continu qui monopolise le thread principal

**[Observé]**

### Le problème
Deux animations tournent sans interruption sur **toutes** les pages du site :
1. `components/layout/space-background.tsx` — un champ d'étoiles en Canvas 2D (160 étoiles + 12 particules), avec `requestAnimationFrame` non plafonné et un `ctx.createRadialGradient()` recréé à chaque frame pour chaque particule.
2. `components/marketing/Planet.tsx` — la sphère 3D WebGL (crystal → lave → soleil), avec un pipeline de post-traitement bloom (`EffectComposer` : RenderPass → SavePass → UnrealBloomPass → OutputPass → AlphaRestorePass), donc 5 passes de rendu par frame.

### Pourquoi ça ralentit le site
Le thread principal du navigateur est partagé entre JavaScript, mise en page, peinture **et** compositing/rastérisation. Une boucle de rendu qui tourne à 60-144 Hz en continu, dès le premier paint, entre en concurrence directe avec l'hydratation React et le rendu du texte critique — surtout sous le throttling CPU 4× que Lighthouse applique en mode mobile (mais le même schéma apparaît côté bureau, avec un throttling personnalisé).

### Impact : **Critique**
C'est la cause racine qui explique à la fois le TBT (22,8-28,6 s) et une bonne partie du LCP anormal (voir constat n°2).

### Solution détaillée
- **Fait dans cette session** : `space-background.tsx` est maintenant plafonné à 30 fps (`FRAME_INTERVAL_MS`) et n'appelle plus `createRadialGradient()` à chaque frame — un sprite de glow est pré-calculé une seule fois et réutilisé via `drawImage()`.
- **À faire** : appliquer le même principe de prudence au composeur bloom de `Planet.tsx` :
  - Retarder le démarrage du rendu WebGL tant que l'hydratation de la page n'est pas terminée (au-delà du `requestIdleCallback` déjà en place, s'assurer qu'il ne se déclenche jamais avant `window.load`).
  - Sur mobile/profil `low`/`reduced`, désactiver purement le bloom (`postFX: false` — déjà fait pour ces profils) et vérifier que le composeur n'est jamais instancié dans ce cas (déjà correct dans le code actuel).
  - Envisager de suspendre complètement le rendu (`cancelAnimationFrame`) quand l'onglet n'est pas visible (`document.visibilityState`), ce qui n'est pas actuellement géré.

### Exemple de code (visibilité d'onglet, à ajouter dans `Planet.tsx`)
```ts
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(rafId);
  } else {
    rafId = requestAnimationFrame(tick);
  }
});
```

### Gain estimé
Le fix déjà appliqué sur `space-background.tsx` devrait réduire le "Other" de plusieurs secondes (le sprite préconstruit élimine l'allocation d'objet `CanvasGradient` la plus coûteuse, 12 fois par frame, sur toutes les pages). Une fois le composeur bloom également maîtrisé, une réduction de 15-25 s du TBT mobile est plausible — **[À vérifier]** par un nouveau rapport PSI après déploiement.

### Priorité : **Quick Win / Critique** — c'est le premier correctif à valider avant tout le reste.

---

## 2. Constat n°2 — LCP mobile à 21,9 s : le H1 du Hero dépend de l'hydratation

**[Observé + Probable]**

### Le problème
`components/marketing/hero.tsx` est un composant **client** (`"use client"`). Le titre H1 — presque certainement l'élément LCP de la page — est enveloppé dans `<motion.h1 initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} transition={{duration:0.75, delay:0.05}}>` (Framer Motion).

### Pourquoi ça ralentit le site
Deux mécanismes se cumulent :
1. **Opacity 0 au départ** : Chrome exclut un élément de la liste des candidats LCP tant qu'il n'a pas d'opacité significative. Le "vrai" LCP n'est donc enregistré qu'une fois l'animation Framer Motion déclenchée — ce qui suppose que React ait hydraté le composant.
2. **L'hydratation elle-même est retardée** par le constat n°1 : si le thread principal est occupé à ~97 % par du travail de rendu Canvas/GPU classé "Other", React n'a pas la main pour hydrater `Hero` avant que ce travail ne libère le thread. Résultat : le texte est déjà présent dans le HTML (SSR), visuellement "affiché" côté utilisateur bien plus tôt (FCP = 0,9 s le confirme), mais Lighthouse n'enregistre le LCP réel qu'au moment où l'animation d'apparition se termine — très tard sous throttling CPU.

C'est cohérent avec les chiffres observés : FCP 0,9 s (le HTML/CSS arrive vite) mais LCP 21,9 s (l'élément "final" au sens de Chrome n'apparaît que très tard) — sans que Speed Index (5,6 s) ne corrobore un vrai blocage visuel aussi long. C'est la signature typique d'un élément LCP gaté par une animation d'opacité + hydratation tardive, pas d'un vrai gel de page de 22 secondes.

### Impact : **Critique** (LCP est la métrique la plus lourde dans le score Performance Lighthouse)

### Solution détaillée
1. **Ne jamais animer l'opacité de l'élément LCP lui-même.** Séparer le H1 en contenu statique (rendu serveur, visible immédiatement, sans classe/style opacity:0) et déplacer l'animation d'entrée sur un wrapper parent ou sur les éléments secondaires (eyebrow, sous-titre, boutons) qui ne sont pas le LCP.
2. **Réduire la dépendance à l'hydratation pour le contenu au-dessus de la ligne de flottaison.** Le H1 et le sous-titre n'ont besoin d'aucune interactivité — ils peuvent rester dans un Server Component. Seul le `useScroll`/`useTransform` (parallax) et les micro-animations d'apparition nécessitent `"use client"` : isoler ce besoin dans un petit wrapper client qui n'enveloppe pas le texte critique.
3. Résoudre le constat n°1 en parallèle — un thread principal libéré plus tôt hydrate `Hero` plus tôt, ce qui améliore le LCP même sans toucher à Framer Motion.

### Exemple de code (H1 statique + wrapper client minimal)
```tsx
// hero.tsx redevient un Server Component
export function Hero({ section }: { section?: SectionContent | null }) {
  return (
    <section className="relative -mt-20 min-h-screen overflow-hidden flex items-center">
      {/* ...overlays... */}
      <HeroParallaxWrapper>
        <p className="uppercase text-[var(--accent-gold)] hero-eyebrow-in">{DEFAULTS.eyebrow}</p>
        {/* H1 SANS opacity:0 initial ni dépendance JS — visible dès le SSR */}
        <h1 className="uppercase text-white hero-title">
          Nous construisons une <span style={{ color: "var(--accent-gold)" }}>présence digitale</span> qui attire, engage et convertit.
        </h1>
        {/* ...reste... */}
      </HeroParallaxWrapper>
    </section>
  );
}
```
```css
/* Animation d'entrée en CSS pur — ne bloque jamais le LCP, tourne dès le paint */
.hero-eyebrow-in { animation: fadeUp .5s ease-out both; }
@keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform:none; } }
```

### Gain estimé
Un LCP ramené de 21,9 s à une valeur proche du FCP actuel (~1-2 s sur mobile throttlé) est réaliste une fois les deux causes traitées — cela seul peut faire remonter le score Performance mobile de 40 à 70+.

### Priorité : **Quick Win / Critique**

---

## 3. JavaScript inutilisé et poids du bundle

**[Observé]**

### Le problème
Lighthouse ("Réduisez les ressources JavaScript inutilisées") relève plusieurs chunks avec une part significative de code mort au chargement initial, notamment un chunk de **293 745 octets dont 140 341 octets (48 %) inutilisés**, et trois autres chunks plus petits (173 383/89 498, 48 306/25 524, 72 056/25 319 octets transférés/inutilisés).

`framer-motion` (^12.40.0) n'est importé que dans **un seul fichier** (`hero.tsx`), mais ce fichier est monté au-dessus de la ligne de flottaison sur la page la plus visitée du site — son moteur d'animation complet (gestion de layout, spring physics, drag, etc.) est donc chargé pour trois fondus d'opacité et un parallax simple.

### Impact : **Élevé** (contribue au TBT et retarde l'Interactive)

### Solution détaillée
- Remplacer les animations d'entrée simples de `hero.tsx` par du CSS pur (voir constat n°2) — cela permet de retirer `framer-motion` de la page d'accueil, ou au minimum de ne charger que `useScroll`/`useTransform` en import ciblé plutôt que le module complet.
- Vérifier avec `next build` + l'analyseur de bundle (`ANALYZE=true` si configuré, ou `@next/bundle-analyzer`) quel chunk correspond exactement aux 140 KB inutilisés — **[À vérifier]**, je n'ai pas pu exécuter de build dans cette session (sandbox indisponible).
- Utiliser `next/dynamic` pour tout composant client non visible au premier écran (formulaires, carrousel Embla, accordéon) — `bundle-dynamic-imports` de vos propres guidelines internes.

### Gain estimé
Retirer ~140 KB de JS inutilisé du chemin critique réduit typiquement le TBT de plusieurs centaines de ms à quelques secondes selon la puissance de l'appareil, et améliore Script Evaluation (déjà faible ici, mais le parsing/compilation en profite aussi).

### Priorité : **Optimisation importante**

---

## 4. Images surdimensionnées

**[Observé]**

### Le problème
Lighthouse relève des paires "taille transférée / taille potentielle après redimensionnement" très proches pour deux images lourdes : **1 625 259 → 1 623 799 octets** et **805 879 → 805 818 octets** (×2, probablement la même image resservie deux fois dans le DOM). L'écart quasi nul signifie que ce n'est pas un problème de compression mais de **dimensions intrinsèques bien supérieures à la taille d'affichage réelle** — l'image est correctement compressée mais son fichier source est trop grand pour l'endroit où elle est affichée.

Ceci confirme et complète le point déjà identifié précédemment dans cette conversation : le logo partenaire Smetec (787 Ko × 2, ~12517×5625 px source) reste non corrigé dans Supabase Storage (bucket `media`, table `partners`).

### Impact : **Élevé** — ces deux images représentent à elles seules plus de 2,4 Mo, une part disproportionnée du poids total de la page.

### Solution détaillée
1. Redimensionner le fichier source à une résolution proche de sa taille d'affichage réelle (×2 pour le Retina) avant upload — un logo de partenaire affiché à 150-200px de large n'a jamais besoin d'une source à 12 500px.
2. Convertir en WebP/AVIF si ce n'est pas déjà le cas (le composant `next/image` du site le fait déjà pour les formats supportés, mais ne peut pas compenser une image source disproportionnée par rapport à sa taille d'affichage — Next.js redimensionne, mais télécharge et traite toujours le fichier source complet côté build/edge).
3. Remplacer par un SVG si le logo est vectoriel à l'origine — poids divisé par 50-100×.

### Gain estimé
~2,4 Mo de moins sur le poids total de page, amélioration directe du LCP si l'une de ces images est dans le chemin critique, et du Speed Index.

### Priorité : **Quick Win**

---

## 5. Dépendance à un CDN tiers (jsDelivr) pour le transcodeur KTX2

**[Observé]**

### Le problème
`components/marketing/planet/ktx2-loader.ts` pointe `KTX2Loader.setTranscoderPath` vers `https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/basis/`. Lighthouse liste ce domaine dans "Réduisez et différez le chargement du code tiers" avec trois ressources (262 492, 244 800 et 17 692 octets).

### Pourquoi ça ralentit le site
Le temps d'exécution sur le thread principal attribué à ces fichiers est de 0 ms (ce n'est pas un problème de calcul), mais chaque dépendance à une origine externe ajoute une résolution DNS + une poignée de main TLS supplémentaires, et retire le contrôle du cache/versioning à votre infrastructure.

### Impact : **Faible à moyen**

### Solution détaillée
Copier les fichiers du transcodeur Basis (`basis_transcoder.js`, `basis_transcoder.wasm`) dans `public/basis/` et pointer `setTranscoderPath("/basis/")`. Le fichier est déjà versionné (three@0.168.0) donc aucun risque de dérive de version.

### Gain estimé
Quelques dizaines à ~150 ms selon la latence réseau de l'utilisateur (élimination d'une connexion cross-origin) — modeste mais gratuit et sans risque.

### Priorité : **Quick Win**

---

## 6. Ressources qui bloquent le rendu

**[Observé]**

### Le problème
Lighthouse chiffre l'économie potentielle à ~110 ms sur "Éliminez les ressources qui bloquent le rendu initial de la page", avec deux ressources identifiées à 12 351 et 14 103 octets.

### Impact : **Faible** (l'économie chiffrée par Lighthouse lui-même est modeste comparée aux autres constats)

### Solution détaillée
Vérifier si ces deux ressources sont des feuilles CSS globales non critiques (ex. styles de sections basses de page) — dans ce cas, extraire le CSS critique above-the-fold et charger le reste en asynchrone, ou s'appuyer sur le découpage automatique de CSS par route de Next.js/Tailwind v4 s'il n'est pas déjà optimal.

### Gain estimé
~110 ms selon Lighthouse.

### Priorité : **Optimisation facultative** (faible gain isolé, mais sans risque)

---

## 7. CSS inutilisé

**[Probable]**

### Le problème
Lighthouse liste l'audit "Réduisez les ressources CSS inutilisées" comme actif sur le rapport, mais je n'ai pas pu extraire le pourcentage exact de règles inutilisées dans cette session.

### Impact : **Moyen [À vérifier]**

### Solution détaillée
Tailwind CSS v4 avec purge automatique (JIT) limite normalement ce problème à la source — le CSS inutilisé restant provient plus probablement de composants tiers (Embla Carousel, accordéon) chargés globalement même sur les pages qui ne les utilisent pas. Vérifier que ces styles sont bien scellés par route/composant plutôt qu'injectés globalement.

### Priorité : **Optimisation importante — à quantifier d'abord**

---

## 8. Tâches longues sur le thread principal

**[Observé]**

### Le problème
Lighthouse recense **20 tâches longues** (>50 ms) sur le thread principal côté mobile.

### Impact : **Élevé** — chaque tâche longue retarde directement l'INP (réactivité aux interactions).

### Solution détaillée
Conséquence directe des constats n°1 et n°3 : une fois le rendu Canvas/WebGL maîtrisé et le JS inutilisé réduit, le nombre de tâches longues devrait chuter mécaniquement. Aucune action isolée supplémentaire nécessaire au-delà de ces deux correctifs — **[À vérifier]** après déploiement.

### Priorité : conséquence des Quick Wins ci-dessus, pas un chantier séparé.

---

## 9. Police web / Font display

**[Observé — déjà correctement implémenté]**

### Constat
`app/layout.tsx` utilise déjà `next/font/google` pour Bebas Neue et Montserrat, avec `display: "swap"` et `preload: true` sur les deux. C'est la configuration recommandée : polices auto-hébergées (aucune requête vers Google Fonts), texte jamais invisible pendant le chargement (pas de FOIT).

Lighthouse mentionne malgré tout un audit "Affichage de la police" dans le rapport — probablement informatif plutôt qu'un échec, car votre configuration suit déjà les bonnes pratiques. **[À vérifier]** sur le rapport post-déploiement pour confirmer que l'audit passe au vert.

### Priorité : Aucune action nécessaire à ce stade.

---

## 10. Décalages de mise en page (CLS)

**[Observé]**

### Constat
**CLS = 0** sur mobile et sur bureau — aucune action nécessaire. C'est l'un des trois piliers Core Web Vitals déjà parfaitement maîtrisé.

### Priorité : Aucune

---

## 11. Temps de réponse serveur (TTFB) et infrastructure

**[Observé]**

### Constat
Lighthouse : *"Le serveur répond rapidement (3 ms observées)"*. Le site est hébergé sur Vercel (déploiement serverless/edge) — TTFB de 3 ms est excellent et confirme que **le backend n'est en aucun cas la source du problème de performance**.

### Points d'infrastructure gérés automatiquement par Vercel (non applicables/non actionnables côté code)
| Point demandé | Statut |
|---|---|
| HTTP/2 ou HTTP/3 | Géré par le edge network Vercel — HTTP/3 actif par défaut sur la plupart des routes |
| Compression Brotli/Gzip | Vercel applique Brotli automatiquement en plus de `compress: true` dans `next.config.ts` |
| CDN | Le edge network Vercel EST le CDN — aucune configuration Cloudflare distincte n'est utilisée ni nécessaire |
| Nginx/Apache/PHP | Non applicable — Next.js serverless, pas de serveur HTTP traditionnel à configurer |
| Base de données/requêtes SQL | Supabase (Postgres géré), interrogé via `unstable_cache` avec `revalidate: 3600` sur les données peu volatiles (ex. `getPartners()`) — pas de requêtes N+1 identifiées dans le code lu |
| DNS Lookup / TLS | Géré par Vercel + le registrar du domaine — hors du contrôle applicatif |
| Redirections | Une seule redirection 301 propre trouvée dans `next.config.ts` (ancien slug de service) — aucune chaîne de redirections détectée |

### Priorité : Aucune action — cette partie de la stack est déjà bien gérée.

---

## 12. Scripts tiers, tracking, publicités

**[Observé]**

### Constat
Seul **Google Analytics 4** est présent (`components/analytics/google-analytics.tsx`), déjà chargé via `next/script` avec `strategy="afterInteractive"` — la stratégie recommandée par Next.js pour ne jamais bloquer le rendu. `dns-prefetch` déjà en place pour `googletagmanager.com` et `google-analytics.com`. Aucun pixel Meta, chat widget, ou script publicitaire détecté dans le code.

### Priorité : Aucune action nécessaire.

---

## 13. Accessibilité (96/100) — écart restant

**[Observé, déjà identifié précédemment dans ce projet]**

Le contraste du token `--accent-gold` utilisé à la fois comme fond de bouton (texte blanc dessus) et comme texte décoratif clair sur fond sombre (ex. le "04" des étapes numérotées) reste en conflit — un seul token ne peut satisfaire les deux contextes de contraste WCAG simultanément. Nécessite un second token CSS dédié à l'usage décoratif. Non corrigé à ce jour.

### Priorité : Optimisation importante (facile à corriger, améliore un score déjà bon vers l'excellent).

---

## 14. Ce qui nécessite une vérification complémentaire

Pour rester honnête sur les limites de cet audit **[À vérifier]** :
- Répartition exacte du CSS inutilisé (%) — nécessite Coverage tab de Chrome DevTools après déploiement.
- Nombre total d'éléments DOM et profondeur — non extrait dans cette session.
- Detail complet de la liste des 20 tâches longues (quelle fonction/fichier précisément) — nécessite un trace Performance Chrome DevTools, pas seulement PSI.
- Impact réel du correctif `space-background.tsx` déjà appliqué — non encore mesuré par un nouveau rapport PSI (fait après la capture des rapports analysés ici).
- Memory leaks, Web Workers, Service Worker : aucun Service Worker ni Web Worker n'est présent dans le code actuel — non applicable, mais aussi une opportunité non exploitée (voir plan d'action).

---

## 15. Classement par priorité

### 🟢 Gains rapides (Quick Wins — à faire en premier, faible effort/risque, fort impact)
1. Fix du rendu Canvas continu — **déjà appliqué** sur `space-background.tsx` (FPS cap + sprite) ce jour ; étendre la même prudence (pause sur `visibilitychange`) à `Planet.tsx`.
2. Redimensionner les deux images de 1,6 Mo et 806 Ko (logos partenaires) à leur taille d'affichage réelle.
3. Auto-héberger le transcodeur KTX2 (jsDelivr → `/public/basis/`).
4. Retirer l'animation d'opacité sur le H1 du Hero (constat n°2) — remplacer par CSS pur, dissocier le texte statique du wrapper client.

### 🟡 Optimisations importantes
5. Réduire le JS inutilisé (chunk 140 KB) — isoler/alléger l'usage de Framer Motion sur `hero.tsx`.
6. Quantifier et réduire le CSS inutilisé.
7. Ajouter un second token de couleur pour résoudre le conflit de contraste `--accent-gold` (accessibilité 96→100).
8. Éliminer les ~110 ms de ressources bloquant le rendu.

### 🔵 Optimisations avancées
9. Mettre en place un budget de performance CI (ex. Lighthouse CI sur chaque déploiement Vercel) pour éviter les régressions futures.
10. Envisager un Service Worker (cache-first pour les assets statiques/textures KTX2) pour les visiteurs récurrents.
11. Profiler `Planet.tsx` avec Chrome DevTools Performance (pas seulement Lighthouse) pour valider précisément le coût du composeur bloom par frame.

### ⚪ Optimisations facultatives
12. Migrer les éventuels champs `<img>` restants hors `next/image` si détectés lors d'un audit de code plus large.
13. Explorer AVIF pour les images qui sont encore servies uniquement en WebP.

---

## 16. Plan d'action étape par étape

**Objectif : Performance mobile > 95, bureau = 100, sans perte de fonctionnalité (planète 3D et fond spatial conservés).**

1. **Déployer le correctif déjà appliqué** à `space-background.tsx` (FPS cap + sprite pré-calculé) → relancer un rapport PSI pour mesurer l'impact réel sur le TBT. C'est le test qui validera ou infirmera le diagnostic du constat n°1.
2. **Appliquer le même traitement à `Planet.tsx`** : pause sur `visibilitychange`, confirmer que le composeur bloom ne s'instancie jamais sur les profils `low`/`reduced`/`mobile`.
3. **Corriger le Hero** : sortir le H1 (et si possible tout le bloc texte statique) d'un composant client, remplacer les animations d'entrée Framer Motion par du CSS pur pour les éléments au-dessus de la ligne de flottaison.
4. **Redimensionner les deux images lourdes** (logos partenaires) dans Supabase Storage.
5. **Auto-héberger le transcodeur KTX2.**
6. **Nouveau rapport PSI** (mobile + bureau) pour mesurer le score après ces 5 correctifs — attendu : passage du TBT de 22-28 s à quelques centaines de ms, LCP mobile de 21,9 s à 1-3 s, score Performance mobile de 40 à 75-90+.
7. **Itérer sur le JS/CSS inutilisés** (constats 3 et 7) pour grappiller les derniers points vers 95+.
8. **Corriger le contraste `--accent-gold`** pour porter l'Accessibilité à 100.
9. **Mettre en place Lighthouse CI ou un contrôle PSI récurrent** pour éviter toute régression future sur ces deux animations, qui sont par nature le poste de risque le plus élevé du site.

---

*Rapport basé sur les rapports PageSpeed Insights fournis (form_factor=mobile, ID `vgbdgtwftx` ; form_factor=desktop, ID `z8q1fwxdg5`, capturés le 6 août 2026 à 22:58) et l'inspection directe du code source du dépôt à la date de rédaction.*
