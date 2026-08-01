"use client";

import { useActionState, useState, useRef, useTransition } from "react";
import { AlertCircle, Upload, X, Loader2, Play, Film } from "lucide-react";
import type { EntityConfig } from "@/lib/entities";
import type { ContentState } from "@/actions/content";
import { uploadImageToSupabase, uploadFileToSupabase } from "@/actions/upload-supabase";
import { parseBool } from "@/lib/parse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type BoundAction = (prevState: ContentState, formData: FormData) => Promise<ContentState>;

const initialState: ContentState = { success: false, message: "" };

/** Champs gérés automatiquement par la BDD — masqués dans le formulaire. */
const AUTO_HIDDEN = new Set(["id", "created_at", "updated_at", "uploaded_at"]);

// ── Resize image client-side (canvas) avant upload ─────────────────────────
async function resizeImageFile(file: File, maxPx = 1920, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width <= maxPx && height <= maxPx) {
        // Pas besoin de redimensionner si déjà petit
        resolve(file);
        return;
      }
      const ratio = Math.min(maxPx / width, maxPx / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const resized = new File(
            [blob!],
            file.name.replace(/\.\w+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          resolve(resized);
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

// ── Image upload ────────────────────────────────────────────────────────────
function ImageUploadField({ fieldKey, defaultValue }: { fieldKey: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    startUpload(async () => {
      try {
        // Redimensionne côté client avant d'envoyer (évite le crash Vercel >4.5 Mo)
        const toUpload = file.type.startsWith("image/")
          ? await resizeImageFile(file)
          : file;
        const fd = new FormData();
        fd.append("file", toUpload);
        const result = await uploadImageToSupabase(fd);
        if (result.success && result.url) {
          setUrl(result.url);
        } else {
          setUploadError(result.error ?? "Erreur lors de l'upload.");
        }
      } catch (err) {
        setUploadError("Erreur inattendue lors de l'upload. Réessayez.");
        console.error(err);
      }
    });
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={fieldKey} value={url} />
      {url && (
        <div className="relative inline-block">
          {/\.(mp4|webm|mov|avi|mkv|m4v)(\?.*)?$/i.test(url) ? (
            <video src={url} className="h-24 w-auto rounded border border-[var(--border)]" muted />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Prévisualisation" className="h-24 w-auto rounded border border-[var(--border)] object-cover" />
          )}
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            title="Supprimer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <Input placeholder="URL du fichier ou uploadez ci-dessous" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*,video/*,.mp4,.webm,.mov,.avi,.mkv,.m4v,.jpg,.jpeg,.png,.webp,.gif,.svg" className="hidden" onChange={handleFile} />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} className="gap-2">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {uploading ? "Upload en cours..." : "Choisir un fichier"}
        </Button>
        <span className="text-xs text-muted-foreground">Images (JPG, PNG, WebP…) ou Vidéos (MP4, WebM, MOV…) · max 100 Mo</span>
      </div>
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

// ── Media field (image OU vidéo) ────────────────────────────────────────────
const ACCEPTED_MEDIA = "image/*,video/*,.mp4,.webm,.mov,.avi,.mkv,.m4v,.jpg,.jpeg,.png,.webp,.gif,.svg";

function MediaFileField({ fieldKey, defaultValue }: { fieldKey: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isVideo = url ? /\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i.test(url) : false;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    startUpload(async () => {
      const result = await uploadFileToSupabase(fd);
      if (result.success && result.url) {
        setUrl(result.url);
      } else {
        setUploadError(result.error ?? "Erreur lors de l'upload.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={fieldKey} value={url} />
      {url && (
        <div className="relative inline-block">
          {isVideo ? (
            <video src={url} className="h-24 w-auto rounded border border-[var(--border)]" muted controls={false} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Prévisualisation" className="h-24 w-auto rounded border border-[var(--border)] object-cover" />
          )}
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            title="Supprimer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}
      <Input placeholder="URL du fichier ou uploadez ci-dessous" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept={ACCEPTED_MEDIA} className="hidden" onChange={handleFile} />
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()} className="gap-2">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-4" />}
          {uploading ? "Upload en cours..." : "Choisir un fichier"}
        </Button>
        <span className="text-xs text-muted-foreground">Images (JPG, PNG, WebP, GIF, SVG · max 5 Mo) ou Vidéos (MP4, WebM, MOV · max 100 Mo)</span>
      </div>
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

// ── Video field ─────────────────────────────────────────────────────────────
function getEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    // YouTube
    const yt = u.searchParams.get("v") || u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      const id = u.searchParams.get("v") ?? u.pathname.replace(/^\//, "").split("/")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

function VideoField({ fieldKey, defaultValue }: { fieldKey: string; defaultValue: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const embedUrl = url ? getEmbedUrl(url) : "";

  return (
    <div className="space-y-2">
      <Input
        name={fieldKey}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
      />
      {embedUrl && (
        <div className="relative aspect-video overflow-hidden rounded-lg border border-[var(--border)] bg-black">
          <iframe src={embedUrl} className="h-full w-full" allowFullScreen title="Prévisualisation vidéo" />
        </div>
      )}
      {!embedUrl && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Play className="size-3" />
          Collez un lien YouTube ou Vimeo pour prévisualiser
        </p>
      )}
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────────────────
export function EntityForm({
  config,
  initialValues,
  action,
  dynamicOptions = {},
}: {
  config: EntityConfig;
  initialValues?: Record<string, string>;
  action: BoundAction;
  /** Options chargées dynamiquement depuis Supabase (fieldKey → string[]) */
  dynamicOptions?: Record<string, string[]>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = initialValues ?? {};
  const isEditing = !!initialValues;

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {config.fields
        .filter((field) => !AUTO_HIDDEN.has(field.key))
        .map((field) => {
          // The 'key' field in settings is the PK — read-only when editing
          const isSettingsPk = field.key === "key" && config.tab === "settings";
          const readOnly = isSettingsPk && isEditing;

          return (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-[var(--accent-gold)]"> *</span>}
                {readOnly && <span className="ml-2 text-xs text-muted-foreground">(non modifiable)</span>}
              </label>

              {field.type === "boolean" ? (
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    id={field.key}
                    name={field.key}
                    type="checkbox"
                    defaultChecked={parseBool(values[field.key])}
                    className="size-4 rounded border-[var(--border)]"
                  />
                  Actif
                </label>
              ) : field.type === "media" ? (
                <MediaFileField fieldKey={field.key} defaultValue={values[field.key] ?? ""} />
              ) : field.type === "image" ? (
                <ImageUploadField fieldKey={field.key} defaultValue={values[field.key] ?? ""} />
              ) : field.type === "video" ? (
                <VideoField fieldKey={field.key} defaultValue={values[field.key] ?? ""} />
              ) : field.type === "select" ? (
                (() => {
                  // Préfère les options dynamiques (Supabase) aux statiques
                  const opts = dynamicOptions[field.key]?.length
                    ? dynamicOptions[field.key]
                    : (field.options ?? []);
                  return (
                    <Select
                      id={field.key}
                      name={field.key}
                      defaultValue={values[field.key] ?? ""}
                      required={field.required}
                      disabled={readOnly}
                    >
                      <option value="" disabled>
                        Choisir...
                      </option>
                      {opts.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Select>
                  );
                })()
              ) : field.type === "textarea" || field.type === "richtext" || field.type === "json" ? (
                <Textarea
                  id={field.key}
                  name={field.key}
                  defaultValue={values[field.key] ?? ""}
                  required={field.required}
                  rows={field.type === "richtext" ? 10 : 4}
                  readOnly={readOnly}
                  className={field.type === "json" ? "font-mono text-xs" : undefined}
                  placeholder={field.type === "json" ? '{"exemple": "valeur"}' : undefined}
                />
              ) : (
                <Input
                  id={field.key}
                  name={field.key}
                  type={field.type === "number" ? "number" : "text"}
                  defaultValue={values[field.key] ?? ""}
                  required={field.required}
                  readOnly={readOnly}
                  className={readOnly ? "cursor-not-allowed opacity-60" : undefined}
                />
              )}
            </div>
          );
        })}

      {state.message && !state.success && (
        <p className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
