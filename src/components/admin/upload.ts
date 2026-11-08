"use client";

import { kindRules, type MediaKind } from "@/lib/media-kinds";
import { formatBytes } from "@/lib/utils/text";

interface UploadAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  folder: string;
  error?: string;
}

/** Client-side type/size checks (the server re-checks after upload). Returns an error message or null. */
export function precheck(file: File, kind: MediaKind): string | null {
  const rules = kindRules(kind);
  if (!rules.accept.includes(file.type)) return `"${file.name}" isn't a supported file type. Use ${rules.label}.`;
  if (file.size > rules.maxBytes) return `"${file.name}" is ${formatBytes(file.size)}. The limit is ${rules.label.split(" up to ")[1] ?? formatBytes(rules.maxBytes)}.`;
  return null;
}

/** Uploads a file straight from the browser to ImageKit (signed), reporting progress 0–100. */
export async function uploadToImageKit(file: File, kind: MediaKind, scope: string | undefined, onProgress: (pct: number) => void): Promise<{ fileId: string; name: string }> {
  const problem = precheck(file, kind);
  if (problem) throw new Error(problem);
  const res = await fetch("/api/upload/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, scope }) });
  const auth = (await res.json().catch(() => ({ error: "Upload service unavailable" }))) as UploadAuthResponse;
  if (!res.ok) throw new Error(auth.error ?? "Could not start the upload");

  const safeName = file.name.replace(/[^\w.-]+/g, "-").slice(-100) || "upload";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("fileName", safeName);
  fd.append("publicKey", auth.publicKey);
  fd.append("signature", auth.signature);
  fd.append("expire", String(auth.expire));
  fd.append("token", auth.token);
  fd.append("folder", auth.folder);
  fd.append("useUniqueFileName", "true");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onerror = () => reject(new Error("Network error while uploading. Check your connection and try again."));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as { fileId?: string; name?: string; message?: string };
        if (xhr.status >= 200 && xhr.status < 300 && body.fileId) resolve({ fileId: body.fileId, name: body.name ?? safeName });
        else reject(new Error(body.message ?? `Upload failed (${xhr.status})`));
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.send(fd);
  });
}
