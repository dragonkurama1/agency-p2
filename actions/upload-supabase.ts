"use server";

/**
 * Upload d'images vers Supabase Storage — Server Action
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     (clé service role — uniquement côté serveur, jamais exposée au client)
 *
 * Installation requise : npm install @supabase/supabase-js
 */

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Uploade un fichier image vers Supabase Storage et retourne son URL publique.
 * Bucket "media" par défaut. Remplace le fichier si le même nom existe.
 */
export async function uploadImageToSupabase(
  formData: FormData,
  bucket = "media"
): Promise<UploadResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return {
      success: false,
      error: "Supabase non configuré. Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local",
    };
  }

  const file = formData.get("file") as File | null;
  if (!file || !file.size) {
    return { success: false, error: "Aucun fichier fourni." };
  }

  // Validation du type MIME
  const isVideo = file.type.startsWith("video/");
  if (!file.type.startsWith("image/") && !isVideo) {
    return { success: false, error: "Type non supporté. Images : JPG, PNG, WebP. Vidéos : MP4, WebM, MOV." };
  }

  const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: isVideo ? "La vidéo ne doit pas dépasser 100 Mo." : "L'image ne doit pas dépasser 5 Mo." };
  }


  try {
    // Nom de fichier unique basé sur le timestamp
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload via l'API REST Supabase Storage (pas besoin du client JS)
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;
    const buffer = await file.arrayBuffer();

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `Erreur Supabase : ${err}` };
    }

    // URL publique
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("[uploadImageToSupabase]", err);
    return { success: false, error: "Erreur réseau lors de l'upload." };
  }
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/**
 * Upload image OU vidéo vers Supabase Storage.
 * Utilisé par le champ "media" dans le formulaire admin.
 * - Images : max 5 Mo
 * - Vidéos : max 100 Mo
 */
export async function uploadFileToSupabase(
  formData: FormData,
  bucket = "media"
): Promise<UploadResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { success: false, error: "Supabase non configuré." };
  }

  const file = formData.get("file") as File | null;
  if (!file || !file.size) {
    return { success: false, error: "Aucun fichier fourni." };
  }

  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return { success: false, error: "Type non supporté. Images : JPG, PNG, WebP, GIF, SVG. Vidéos : MP4, WebM, MOV." };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { success: false, error: isVideo ? "La vidéo ne doit pas dépasser 100 Mo." : "L'image ne doit pas dépasser 5 Mo." };
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: buffer,
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `Erreur Supabase : ${err}` };
    }

    return { success: true, url: `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}` };
  } catch (err) {
    console.error("[uploadFileToSupabase]", err);
    return { success: false, error: "Erreur réseau lors de l'upload." };
  }
}
