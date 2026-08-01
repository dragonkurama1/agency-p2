/**
 * @deprecated Migré vers Supabase Storage. Ce fichier peut être supprimé manuellement.
 */

export function isGoogleDriveConfigured(): boolean {
  return false;
}

export async function uploadFileToDrive(_args: {
  name: string;
  type: string;
  buffer: Buffer;
}): Promise<{ driveFileId: string; driveUrl: string }> {
  throw new Error("Google Drive supprimé — utiliser Supabase Storage.");
}
