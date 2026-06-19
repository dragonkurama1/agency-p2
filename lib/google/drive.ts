import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Client Google Drive (service account). Utilisé uniquement côté serveur
 * (Server Actions / Route Handlers) pour uploader les médias du dashboard.
 *
 * Configuration requise (.env) :
 *  GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID
 */

export function isGoogleDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
}

export async function uploadFileToDrive(file: { name: string; type: string; buffer: Buffer }) {
  const drive = google.drive({ version: "v3", auth: getAuth() });

  const res = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: {
      mimeType: file.type,
      body: Readable.from(file.buffer),
    },
    fields: "id, webViewLink",
  });

  const fileId = res.data.id!;

  // Rendre le fichier lisible via lien (la diffusion réelle passe par /api/media/[id])
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return { driveFileId: fileId, driveUrl: `https://drive.google.com/uc?id=${fileId}` };
}

export async function getDriveFileStream(fileId: string) {
  const drive = google.drive({ version: "v3", auth: getAuth() });
  const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
  return res.data as NodeJS.ReadableStream;
}
