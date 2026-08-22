/**
 * Configuration centrale des 15 onglets Google Sheets.
 * Sert à la fois aux fetchers publics (data/*.ts) et au dashboard admin
 * générique (app/(protected)/dashboard/[entity]) : une seule source de vérité
 * pour les colonnes, évite de dupliquer la définition à 15 endroits.
 */

export type FieldType = "text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "json" | "date" | "image" | "video" | "media";

export interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** Si défini, les options sont chargées dynamiquement depuis la table `categories`
   *  (entity = dynamicCategory) au lieu d'utiliser `options` statiques. */
  dynamicCategory?: string;
  required?: boolean;
}

export interface EntityConfig {
  tab: string;
  label: string;
  description: string;
  fields: EntityField[];
  listColumns: string[]; // colonnes affichées dans le tableau du dashboard
}

export const STATUTS_CONTACT = ["Nouveau", "Contacté", "Traité"];
export const STATUTS_DEVIS = ["Nouveau", "Contacté", "Devis envoyé", "Gagné", "Perdu"];

export const entities: Record<string, EntityConfig> = {
  pages: {
    tab: "pages",
    label: "Pages",
    description: "Contenu et SEO des pages statiques (Accueil, Fondateurs, Partenaires...)",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "content", label: "Contenu", type: "richtext" },
      { key: "meta_title", label: "Meta title", type: "text" },
      { key: "meta_description", label: "Meta description", type: "textarea" },
      { key: "og_image", label: "Image OG", type: "image" },
      { key: "status", label: "Statut", type: "select", options: ["draft", "published"] },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["slug", "title", "status", "updated_at"],
  },
  sections: {
    tab: "sections",
    label: "Sections",
    description: "Blocs réutilisables d'une page (hero, chiffres clés, process...)",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "page_slug", label: "Page", type: "text", required: true },
      { key: "section_key", label: "Clé de section", type: "text", required: true },
      { key: "title", label: "Titre", type: "text" },
      { key: "subtitle", label: "Sous-titre", type: "text" },
      { key: "content", label: "Contenu", type: "richtext" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "button_text", label: "Texte bouton", type: "text" },
      { key: "button_link", label: "Lien bouton", type: "text" },
      { key: "order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["page_slug", "section_key", "order", "active"],
  },
  services: {
    tab: "services",
    label: "Services",
    description: "Les 10 pages services (SEO, branding, dev web...)",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "short_description", label: "Description courte", type: "textarea" },
      { key: "full_description", label: "Description complète", type: "richtext" },
      { key: "icon", label: "Icône (lucide)", type: "text" },
      { key: "image_url", label: "Image", type: "image" },
      { key: "meta_title", label: "Meta title", type: "text" },
      { key: "meta_description", label: "Meta description", type: "textarea" },
      { key: "keywords", label: "Mots-clés", type: "text" },
      {
        key: "advantages_json",
        label: 'Avantages (JSON array ex: ["Audit clair","Reporting mensuel"])',
        type: "json",
      },
      {
        key: "process_json",
        label: 'Processus (JSON array ex: ["Audit","Plan d’action","Suivi"])',
        type: "json",
      },
      { key: "faq_json", label: "FAQ (JSON)", type: "json" },
      {
        key: "related_json",
        label: 'Services liés (JSON array de slugs ex: ["seo-referencement-naturel-maroc"])',
        type: "json",
      },
      { key: "order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["slug", "title", "order", "active"],
  },
  projects: {
    tab: "projects",
    label: "Réalisations",
    description: "Portfolio / case studies clients",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "client_name", label: "Client", type: "text" },
      { key: "category", label: "Catégorie ADN", type: "select", dynamicCategory: "projects" },
      { key: "sector", label: "Catégorie liée / secteur", type: "select", dynamicCategory: "projects" },
      { key: "featured", label: "Mise en avant (vedette)", type: "boolean" },
      { key: "description", label: "Description courte", type: "textarea" },
      { key: "logo_url", label: "Logo client", type: "image" },
      { key: "cover_image", label: "Image de couverture", type: "image" },
      { key: "objective", label: "Objectif", type: "textarea" },
      { key: "solution", label: "Solution", type: "richtext" },
      { key: "results", label: "Résultats", type: "richtext" },
      {
        key: "services_json",
        label: 'Services (JSON array ex: ["SEO","Branding"])',
        type: "json",
      },
      {
        key: "sections_json",
        label: 'Sections (JSON array ex: [{"title":"...","text":"...","media":[]}])',
        type: "json",
      },
      { key: "gallery_json", label: "Galerie médias (JSON array d'URLs)", type: "json" },
      { key: "video_url", label: "Vidéo principale (URL ou MP4)", type: "media" },
      { key: "catalogue_json", label: "Catalogue étude projet (JSON)", type: "json" },
      { key: "testimonial_quote", label: "Citation témoignage", type: "textarea" },
      { key: "testimonial_author", label: "Auteur du témoignage", type: "text" },
      { key: "meta_title", label: "Meta title", type: "text" },
      { key: "meta_description", label: "Meta description", type: "textarea" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "created_at", label: "Créé", type: "date" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["title", "client_name", "category", "sector", "featured", "active"],
  },
  blog_posts: {
    tab: "blog_posts",
    label: "Articles de blog",
    description: "Articles SEO du blog",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Titre", type: "text", required: true },
      { key: "excerpt", label: "Extrait", type: "textarea" },
      { key: "content", label: "Contenu", type: "richtext" },
      { key: "cover_image", label: "Image de couverture", type: "image" },
      { key: "category", label: "Catégorie", type: "select", dynamicCategory: "blog_posts" },
      { key: "tags", label: "Tags", type: "text" },
      { key: "author", label: "Auteur", type: "text" },
      { key: "meta_title", label: "Meta title", type: "text" },
      { key: "meta_description", label: "Meta description", type: "textarea" },
      { key: "faq_json", label: "FAQ (JSON)", type: "json" },
      { key: "status", label: "Statut", type: "select", options: ["draft", "published"] },
      { key: "published_at", label: "Publié le", type: "date" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["title", "category", "status", "published_at"],
  },
  team: {
    tab: "team",
    label: "Fondateurs / Équipe",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "role", label: "Rôle", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "linkedin", label: "LinkedIn", type: "text" },
      { key: "instagram", label: "Instagram", type: "text" },
      { key: "order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["name", "role", "order", "active"],
  },
  partners: {
    tab: "partners",
    label: "Partenaires",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "name", label: "Nom", type: "text", required: true },
      { key: "logo_url", label: "Logo", type: "image" },
      { key: "website", label: "Site web", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["name", "website", "order", "active"],
  },
  testimonials: {
    tab: "testimonials",
    label: "Témoignages",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "client_name", label: "Nom client", type: "text", required: true },
      { key: "company", label: "Entreprise", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "rating", label: "Note", type: "number" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "service", label: "Service concerné", type: "text" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "created_at", label: "Créé", type: "date" },
    ],
    listColumns: ["client_name", "company", "rating", "active"],
  },
  media: {
    tab: "media",
    label: "Médias",
    description: "Fichiers uploadés vers Supabase Storage",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "file_name", label: "Nom du fichier", type: "text" },
      { key: "file_type", label: "Type MIME", type: "text" },
      { key: "file_url", label: "Fichier (image ou vidéo)", type: "media" },
      { key: "alt_text", label: "Texte alternatif", type: "text" },
      { key: "uploaded_at", label: "Uploadé le", type: "date" },
    ],
    listColumns: ["file_name", "file_type", "uploaded_at"],
  },
  leads_contact: {
    tab: "leads_contact",
    label: "Leads — Contact",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "name", label: "Nom", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Téléphone", type: "text" },
      { key: "company", label: "Entreprise", type: "text" },
      { key: "message", label: "Message", type: "textarea" },
      { key: "source_page", label: "Page source", type: "text" },
      { key: "status", label: "Statut", type: "select", options: STATUTS_CONTACT },
      { key: "notes", label: "Notes internes", type: "textarea" },
      { key: "created_at", label: "Créé", type: "date" },
    ],
    listColumns: ["name", "email", "status", "created_at"],
  },
  leads_devis: {
    tab: "leads_devis",
    label: "Leads — Devis",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "name", label: "Nom", type: "text" },
      { key: "company", label: "Entreprise", type: "text" },
      { key: "phone", label: "Téléphone", type: "text" },
      { key: "email", label: "Email", type: "text" },
      { key: "city", label: "Ville", type: "text" },
      { key: "website", label: "Site actuel", type: "text" },
      { key: "social_links", label: "Réseaux", type: "text" },
      { key: "selected_services", label: "Services demandés", type: "text" },
      { key: "budget", label: "Budget", type: "text" },
      { key: "timeline", label: "Lancement souhaité", type: "text" },
      { key: "objective", label: "Objectif", type: "text" },
      { key: "project_description", label: "Description projet", type: "textarea" },
      { key: "file_url", label: "Fichier joint", type: "text" },
      { key: "status", label: "Statut", type: "select", options: STATUTS_DEVIS },
      { key: "notes", label: "Notes internes", type: "textarea" },
      { key: "created_at", label: "Créé", type: "date" },
    ],
    listColumns: ["name", "company", "budget", "status", "created_at"],
  },
  faq: {
    tab: "faq",
    label: "FAQ globale",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "page_slug", label: "Page", type: "text" },
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Réponse", type: "textarea", required: true },
      { key: "order", label: "Ordre", type: "number" },
      { key: "active", label: "Actif", type: "boolean" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["page_slug", "question", "order", "active"],
  },
  seo_keywords: {
    tab: "seo_keywords",
    label: "Mots-clés SEO",
    description: "",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      { key: "page_slug", label: "Page", type: "text", required: true },
      { key: "primary_keyword", label: "Mot-clé principal", type: "text" },
      { key: "secondary_keywords", label: "Mots-clés secondaires", type: "text" },
      { key: "search_intent", label: "Intention de recherche", type: "text" },
      { key: "title_suggestion", label: "Suggestion de title", type: "text" },
      { key: "description_suggestion", label: "Suggestion de description", type: "textarea" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["page_slug", "primary_keyword", "updated_at"],
  },
  settings: {
    tab: "settings",
    label: "Paramètres",
    description: "Téléphone, email, adresse, réseaux, horaires...",
    fields: [
      { key: "key", label: "Clé", type: "text", required: true },
      { key: "value", label: "Valeur", type: "text" },
      { key: "type", label: "Type", type: "text" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["key", "value", "updated_at"],
  },
  categories: {
    tab: "categories",
    label: "Catégories",
    description: "Gérez les catégories pour les réalisations, l'ADN et les articles de blog",
    fields: [
      { key: "id", label: "ID", type: "text", required: true },
      {
        key: "entity",
        label: "Appartient à",
        type: "select",
        options: ["projects", "blog_posts"],
        required: true,
      },
      { key: "name", label: "Nom de la catégorie", type: "text", required: true },
      { key: "order", label: "Ordre d'affichage", type: "number" },
      { key: "active", label: "Active", type: "boolean" },
      { key: "created_at", label: "Créé", type: "date" },
      { key: "updated_at", label: "Mis à jour", type: "date" },
    ],
    listColumns: ["entity", "name", "order", "active"],
  },
  audit_log: {
    tab: "audit_log",
    label: "Audit log",
    description: "Historique des modifications admin (lecture seule)",
    fields: [
      { key: "id", label: "ID", type: "text" },
      { key: "admin_email", label: "Admin", type: "text" },
      { key: "action", label: "Action", type: "text" },
      { key: "entity_type", label: "Entité", type: "text" },
      { key: "entity_id", label: "ID entité", type: "text" },
      { key: "details", label: "Détails", type: "text" },
      { key: "created_at", label: "Date", type: "date" },
    ],
    listColumns: ["admin_email", "action", "entity_type", "created_at"],
  },
};

export const entityKeys = Object.keys(entities);
