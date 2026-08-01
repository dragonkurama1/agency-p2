"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface MediaState {
  success: boolean;
  message: string;
  url?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 Mo
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 Mo

export async function uploadMedia(_prevState: MediaState, formData: FormData): Promise<MediaState> {
  const file = formData.get("file");
  const altText = String(formData.get("alt_text") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Sélectionnez un fichier." };
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, message: "Type non supporté. Images : JPG, PNG, WebP, GIF, SVG. Vidéos : MP4, WebM, MOV." };
  }

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    return { success: false, message: isVideo ? "La vidéo ne doit pas dépasser 100 Mo." : "L'image ne doit pas dépasser 5 Mo." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey || serviceKey.startsWith("REMPLACER")) {
    return { success: false, message: "Supabase n'est pas configuré. Ajoutez SUPABASE_SERVICE_ROLE_KEY dans .env.local." };
  }

  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();

    // Upload vers Supabase Storage (bucket "media")
    const uploadUrl = `${supabaseUrl}/storage/v1/object/media/${fileName}`;
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
      console.error("Supabase Storage error:", err);
      return { success: false, message: "Erreur lors de l'upload vers Supabase Storage." };
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${fileName}`;

    // Enregistrer dans la table media
    const supabase = getSupabaseAdmin();
    await supabase.from("media").insert({
      id: randomUUID(),
      file_name: file.name,
      file_type: file.type,
      file_url: publicUrl,
      alt_text: altText,
      uploaded_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard/media");
    return { success: true, message: isVideo ? "Vidéo uploadée avec succès." : "Image uploadée avec succès.", url: publicUrl };
  } catch (error) {
    console.error("uploadMedia", error);
    return { success: false, message: "Erreur lors de l'upload. Réessayez." };
  }
}

export async function deleteMediaRow(id: string) {
  try {
    const supabase = getSupabaseAdmin();
    // Récupérer l'URL avant suppression pour effacer le fichier Storage
    const { data } = await supabase.from("media").select("file_url").eq("id", id).single();
    if (data?.file_url) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && serviceKey) {
        // Extraire le nom du fichier de l'URL
        const fileName = data.file_url.split("/media/").pop();
        if (fileName) {
          await fetch(`${supabaseUrl}/storage/v1/object/media/${fileName}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${serviceKey}` },
          });
        }
      }
    }
    await supabase.from("media").delete().eq("id", id);
    revalidatePath("/dashboard/media");
  } catch (error) {
    console.error("deleteMediaRow", error);
  }
}
