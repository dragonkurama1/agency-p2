# Prestigia Agency - Site web

Site Next.js App Router pour Prestigia Agency : pages marketing, réalisations, blog, formulaires de contact/devis et dashboard admin relié à Supabase.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

Le site public peut afficher les données de secours présentes dans `lib/seed-data.ts` si Supabase ne retourne rien. Le dashboard admin nécessite les variables Supabase et les identifiants admin.

## Variables d'environnement

Copier `.env.example` vers `.env.local`, puis remplir :

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publique utilisée pour les lectures.
- `SUPABASE_SERVICE_ROLE_KEY` : clé serveur pour les écritures admin et uploads.
- `ADMIN_EMAIL` : email de connexion au dashboard.
- `ADMIN_PASSWORD_HASH` : hash bcrypt du mot de passe admin.
- `SESSION_SECRET` : secret long pour signer les sessions.

Ne jamais committer `.env.local`.

## Supabase

Les tables attendues sont définies dans `supabase/schema.sql` et dans `lib/entities.ts`.

Tables principales :

- `pages`, `sections`, `settings`
- `services`, `projects`, `blog_posts`
- `team`, `partners`, `testimonials`, `faq`
- `media`, `categories`, `seo_keywords`
- `leads_contact`, `leads_devis`, `audit_log`

Le dossier `supabase/` contient :

- `schema.sql` : structure principale.
- `seed.sql` et `seed-pages.sql` : données de départ.
- `project-category-linking.sql` : liaison catégories/projets.

## Dashboard

URL : `/login`, puis `/dashboard`.

Le dashboard est généré depuis `lib/entities.ts`. Chaque entité déclare :

- la table Supabase (`tab`)
- les champs éditables
- les colonnes visibles en liste
- les types de champs (`text`, `image`, `media`, `json`, etc.)

Les Server Actions dans `actions/` gèrent l'auth, les formulaires, les contenus, les médias et la revalidation cache.

## Structure

```text
app/
  (site)/          pages publiques
  (protected)/     dashboard admin
  login/           connexion admin
  sitemap.ts       sitemap dynamique
  robots.ts        règles d'indexation
actions/           Server Actions
components/        UI, marketing, dashboard, formulaires, SEO
data/              fetchers Supabase + fallback
lib/
  entities.ts      configuration dashboard
  seed-data.ts     données de secours
  supabase.ts      clients Supabase
  auth.ts          sessions admin
public/            images, vidéos et assets statiques
supabase/          SQL de structure et seed
```

## Pages publiques

- Accueil : `app/(site)/page.tsx`
- Services : `app/(site)/services`
- Réalisations ADN : `app/(site)/realisations`
- Détail réalisation : `app/(site)/realisations/[slug]`
- Blog : `app/(site)/blog`
- Fondateurs, partenaires, devis, contact, mentions légales, confidentialité

## Assets importants

- `public/logo-prestigia.png` : logo affiché dans header/footer.
- `public/hero-prestigia-signature.webp` : hero desktop.
- `public/hero-prestigia-signature-mobile.webp` : hero mobile.
- `public/space-background.webp` : fond spatial léger.
- `public/whatsapp-icon.webp` : bouton WhatsApp flottant.
- `public/uploads/projects/prof-amouz/` : médias locaux du cas Prof Amouz.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- Framer Motion
- Three.js
- lucide-react
- jose + bcryptjs

## Vérifications

```bash
npm run lint
npm run build
```

Le projet n'a pas de suite de tests dédiée pour le moment.
