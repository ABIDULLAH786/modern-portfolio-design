import "server-only";
import crypto from "node:crypto";
import { env, imagekitConfigured } from "@/env";

export interface RemoteFile {
  fileId: string;
  name: string;
  filePath: string;
  url: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  fileType: string;
}

export interface UploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

/** Storage abstraction (Architecture §10). ImageKit today; S3 or another provider could implement it later. */
export interface MediaService {
  configured(): boolean;
  uploadAuth(): UploadAuth;
  getFile(fileId: string): Promise<RemoteFile>;
  deleteFile(fileId: string): Promise<void>;
  listFolder(folder: string): Promise<RemoteFile[]>;
  uploadBuffer(data: Buffer, fileName: string, folder: string): Promise<RemoteFile>;
  blurDataUrl(url: string): Promise<string | undefined>;
}

const API = "https://api.imagekit.io/v1";
const UPLOAD = "https://upload.imagekit.io/api/v1/files/upload";

function authHeader(): string {
  return `Basic ${Buffer.from(`${env().IMAGEKIT_PRIVATE_KEY ?? ""}:`).toString("base64")}`;
}

function normalise(raw: Record<string, unknown>): RemoteFile {
  return {
    fileId: String(raw.fileId ?? ""),
    name: String(raw.name ?? ""),
    filePath: String(raw.filePath ?? ""),
    url: String(raw.url ?? ""),
    mime: String(raw.mime ?? ""),
    size: Number(raw.size ?? 0),
    width: Number(raw.width ?? 0),
    height: Number(raw.height ?? 0),
    fileType: String(raw.fileType ?? ""),
  };
}

async function ik<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: { Authorization: authHeader(), ...(init?.headers ?? {}) }, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ImageKit ${init?.method ?? "GET"} ${path} failed (${res.status}): ${body.slice(0, 200)}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const imagekit: MediaService = {
  configured: imagekitConfigured,

  uploadAuth() {
    const e = env();
    if (!imagekitConfigured()) throw new Error("ImageKit is not configured");
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 30 * 60;
    const signature = crypto.createHmac("sha1", e.IMAGEKIT_PRIVATE_KEY!).update(token + expire).digest("hex");
    return { token, expire, signature, publicKey: e.IMAGEKIT_PUBLIC_KEY!, urlEndpoint: e.IMAGEKIT_URL_ENDPOINT! };
  },

  async getFile(fileId) {
    if (!/^[\w-]{6,64}$/.test(fileId)) throw new Error("Invalid file id");
    return normalise(await ik<Record<string, unknown>>(`/files/${fileId}/details`));
  },

  async deleteFile(fileId) {
    if (!/^[\w-]{6,64}$/.test(fileId)) return;
    try {
      await ik<void>(`/files/${fileId}`, { method: "DELETE" });
    } catch (e) {
      // Already gone on ImageKit → treat as deleted.
      if (e instanceof Error && e.message.includes("(404)")) return;
      throw e;
    }
  },

  async listFolder(folder) {
    const q = new URLSearchParams({ path: folder, type: "file", limit: "1000" });
    const rows = await ik<Array<Record<string, unknown>>>(`/files?${q.toString()}`);
    return rows.map(normalise);
  },

  async uploadBuffer(data, fileName, folder) {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(data)]), fileName);
    form.append("fileName", fileName);
    form.append("folder", folder);
    form.append("useUniqueFileName", "true");
    const res = await fetch(UPLOAD, { method: "POST", headers: { Authorization: authHeader() }, body: form });
    if (!res.ok) throw new Error(`ImageKit upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
    const raw = (await res.json()) as Record<string, unknown>;
    // The upload response has no mime; fetch details for a complete record.
    return this.getFile(String(raw.fileId));
  },

  async blurDataUrl(url) {
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}tr=w-16,q-40,bl-6`, { cache: "no-store" });
      if (!res.ok) return undefined;
      const type = res.headers.get("content-type") ?? "image/jpeg";
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength > 3000) return undefined;
      return `data:${type};base64,${buf.toString("base64")}`;
    } catch {
      return undefined;
    }
  },
};

export const media: MediaService = imagekit;
