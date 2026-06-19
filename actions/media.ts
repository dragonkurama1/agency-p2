"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { isGoogleDriveConfigured, uploadFileToDrive } from "@/lib/google/drive";
import { appendSheetRow, deleteSheetRowById, isGoogleSheetsConfigured } from "@/lib/google/sheets";
import { entities } from "@/lib/entities";

export interface MediaState {
  success: boolean;
  message: string;
}

export async function uploadMedia(_prevState: MediaState, formData: FormData): Promise<MediaState> {
  const file = formData.get("file");
  const altText = String(formData.get("alt_text") ?? "");
  const folder = String(formData.get("folder") ?? "general");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Sélectionnez un fichier." };
  }

  if (!isGoogleDriveConfigured() || !isGoogleSheetsConfigured()) {
    return { success: false, message: "Google Drive/Sheets non configurés (.env). Voir README." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { driveFileId, driveUrl } = await uploadFileToDrive({ name: file.name, type: file.type, buffer });

    const row = {
      id: randomUUID(),
      file_name: file.name,
      file_type: file.type,
      drive_file_id: driveFileId,
      drive_url: driveUrl,
      folder,
      alt_text: altText,
      uploaded_at: new Date().toISOString(),
    };

    await appendSheetRow("media", entities.media.fields.map((f) => f.key), row);
    revalidatePath("/dashboard/media");
    return { success: true, message: "Fichier envoyé sur Google Drive." };
  } catch (error) {
    console.error("uploadMedia", error);
    return { success: false, message: "Erreur lors de l'envoi. Vérifiez la configuration Drive." };
  }
}

export async function deleteMediaRow(id: string) {
  if (!isGoogleSheetsConfigured()) return;
  try {
    await deleteSheetRowById("media", id);
    revalidatePath("/dashboard/media");
  } catch (error) {
    console.error("deleteMediaRow", error);
  }
}
