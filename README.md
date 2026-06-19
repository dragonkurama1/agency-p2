# Prestigia Agency — Site web

Site refait avec Next.js (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion. Le contenu (pages, services, réalisations, blog, équipe, leads...) vit dans Google Sheets, les médias dans Google Drive. **Aucune clé Google n'est exposée côté client** : tous les accès Google passent par `lib/google/sheets.ts` et `lib/google/drive.ts`, importés uniquement depuis des Server Components, Server Actions ou `proxy.ts` (Edge).

## 1. Démarrage rapide (mode démo, sans Google Sheets)

Le site fonctionne out-of-the-box avec des données d'exemple (`data/*.ts`) si aucune variable Google n'est configurée — pratique pour prévisualiser le design avant de connecter Google.

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000.

⚠️ Le dashboard admin (`/dashboard`) nécessite, lui, une vraie connexion Google Sheets (pas de mode démo côté admin).

## 2. Connecter Google Sheets + Google Drive

### a. Créer le Google Sheet

Créer un Google Sheet avec exactement ces 15 onglets (noms en minuscules, identiques à `lib/entities.ts`) : `pages`, `sections`, `services`, `projects`, `blog_posts`, `team`, `partners`, `testimonials`, `media`, `leads_contact`, `leads_devis`, `faq`, `seo_keywords`, `settings`, `audit_log`.

Pour chaque onglet, la première ligne doit contenir les en-têtes de colonnes (clés exactes listées dans `lib/entities.ts`, ex. pour `services` : `id, slug, title, short_description, full_description, icon, image_url, meta_title, meta_description, keywords, faq_json, order, active, updated_at`).

Récupérer l'ID du Sheet dans son URL : `https://docs.google.com/spreadsheets/d/SHEET_ID_ICI/edit`.

### b. Créer le compte de service Google Cloud

1. Aller sur https://console.cloud.google.com/ → créer (ou choisir) un projet.
2. Activer les API **Google Sheets API** et **Google Drive API**.
3. IAM & Admin → Comptes de service → Créer un compte de service.
4. Onglet "Clés" → Ajouter une clé → JSON. Télécharger le fichier.
5. Dans le JSON téléchargé : `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `private_key` → `GOOGLE_PRIVATE_KEY`.
6. **Partager le Google Sheet** avec l'adresse `client_email` ci-dessus (rôle "Éditeur").

### c. Créer le dossier Google Drive (médias)

1. Créer un dossier Drive dédié aux médias du site.
2. Le partager (rôle "Éditeur") avec la même adresse `client_email`.
3. Récupérer l'ID du dossier dans son URL : `https://drive.google.com/drive/folders/FOLDER_ID_ICI`.

### d. Variables d'environnement

Copier `.env.example` vers `.env.local` et remplir :

```bash
cp .env.example .env.local
```

- `GOOGLE_SERVICE_ACCOUNT_EMAIL` — depuis le JSON du compte de service
- `GOOGLE_PRIVATE_KEY` — depuis le JSON (garder les `\n`, entre guillemets)
- `GOOGLE_SHEET_ID` — ID du Sheet (étape a)
- `GOOGLE_DRIVE_FOLDER_ID` — ID du dossier Drive (étape c)
- `ADMIN_EMAIL` — email de connexion au dashboard
- `ADMIN_PASSWORD_HASH` — générer avec :
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('VotreMotDePasse', 10))"
  ```
- `SESSION_SECRET` — générer avec :
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Ne jamais committer `.env.local`. En production (Vercel), renseigner ces mêmes variables dans Project Settings → Environment Variables — `GOOGLE_PRIVATE_KEY` doit garder ses `\n` littéraux.

## 3. Dashboard admin

URL : `/login`, puis `/dashboard`. Protégé par session JWT (cookie httpOnly 8h), vérifiée à la fois dans `proxy.ts` (Edge, avant rendu) et dans le layout protégé (defense-in-depth).

Le dashboard est généré automatiquement à partir de `lib/entities.ts` : une page liste + créer + éditer + supprimer pour chacun des 15 onglets, plus une page Médias dédiée (upload vers Drive). Export CSV disponible sur chaque liste.

Il n'y a pas de base d'utilisateurs : un seul compte admin défini par `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`. Pour changer le mot de passe, régénérer le hash et remplacer la variable d'environnement.

## 4. Déploiement (Vercel)

1. Pousser le projet sur un repo Git (GitHub/GitLab/Bitbucket).
2. Importer le repo sur https://vercel.com/new.
3. Renseigner toutes les variables d'environnement (section 2.d) dans Vercel.
4. Déployer. Le framework Next.js est détecté automatiquement.
5. Une fois en ligne, mettre à jour `lib/site-config.ts` (`url`) avec le vrai domaine — utilisé par `sitemap.xml`, `robots.txt`, les balises Open Graph et le JSON-LD.
6. Configurer le domaine personnalisé dans Vercel → Domains.

## 5. Checklist SEO

- [x] `app/sitemap.ts` — sitemap dynamique (pages statiques + services + réalisations + articles de blog)
- [x] `app/robots.ts` — autorise tout sauf `/dashboard`, `/login`, `/api/`
- [x] `app/manifest.ts` — PWA manifest
- [x] Metadata par page (title/description/canonical/Open Graph/Twitter Card) sur toutes les pages publiques
- [x] JSON-LD (Organization, et selon page : Service, Article, FAQPage...)
- [ ] Remplacer les icônes placeholder de `public/` (favicon, icône PWA, image Open Graph par défaut `/og-image.png`) par les vrais visuels de marque
- [ ] Soumettre le sitemap à Google Search Console une fois le domaine final en ligne
- [ ] Vérifier les Core Web Vitals sur PageSpeed Insights après déploiement

## 6. Checklist sécurité

- [x] Clés Google jamais exposées côté client (lecture uniquement dans des fichiers serveur)
- [x] Routes `/dashboard/*` protégées par middleware Edge (`proxy.ts`) + vérification serveur
- [x] Cookie de session httpOnly, `secure` en production, expiration 8h
- [x] Mot de passe admin stocké en hash bcrypt (jamais en clair)
- [x] `/dashboard`, `/login`, `/api/` exclus de l'indexation (`robots.ts` + `noindex` sur `/login`)
- [ ] Penser à régénérer `SESSION_SECRET` et `ADMIN_PASSWORD_HASH` avant la mise en production (ne pas réutiliser des valeurs de test)
- [ ] Restreindre l'accès au Google Sheet et au dossier Drive au seul compte de service (pas de partage public)

## 7. Données d'exemple (seed data)

`data/*.ts` contient des données d'exemple en dur (services, réalisations, articles, équipe...), utilisées automatiquement par les pages publiques tant que Google Sheets n'est pas configuré (`isGoogleSheetsConfigured()` retourne `false`). Dès que les variables Google sont renseignées, ces fetchers basculent sur les vraies données du Sheet. Le dashboard admin, lui, nécessite toujours une connexion Google Sheets active (pas de fallback sur les données d'exemple).

## 8. Stack technique

- Next.js 16 (App Router, Turbopack, Server Actions, Server Components)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (composants dans `components/ui`)
- Framer Motion (animations)
- react-hook-form + zod (formulaires : Devis, Contact, Login, Dashboard)
- googleapis (Sheets + Drive, côté serveur uniquement)
- jose (JWT) + bcryptjs (hash mot de passe)

## 9. Structure du projet

```
app/
  (site)/          pages publiques (accueil, services, réalisations, blog, devis, contact, fondateurs, partenaires...)
  (protected)/      dashboard admin (auth requise)
  login/            page de connexion
  sitemap.ts, robots.ts, manifest.ts
actions/            Server Actions (auth, contenu, médias, formulaires)
components/         composants UI (marketing, dashboard, formulaires, seo)
data/               fetchers publics + données d'exemple (fallback)
lib/
  google/           sheets.ts, drive.ts — accès Google, SERVEUR UNIQUEMENT
  entities.ts       schéma des 15 onglets Google Sheets (source de vérité dashboard)
  auth.ts           sessions JWT
  site-config.ts    constantes du site (nom, url, contact...)
proxy.ts             protection des routes /dashboard (Edge)
```
