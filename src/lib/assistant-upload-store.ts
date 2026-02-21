import fs from "node:fs";
import path from "node:path";

export const MAX_ASSISTANT_UPLOAD_SIZE = 4 * 1024 * 1024;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ASSISTANT_BUCKET = process.env.SUPABASE_ASSISTANT_BUCKET || "assistant-data";

export function getAssistantUploadDir() {
  if (process.env.VERCEL) {
    return "/tmp/marcelino-uploads";
  }
  return path.join(process.cwd(), ".data", "marcelino-uploads");
}

export function ensureAssistantUploadDir() {
  const dir = getAssistantUploadDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getAssistantUploadPath(fileName: string) {
  return path.join(getAssistantUploadDir(), fileName);
}

function canUseSupabaseStorage() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ASSISTANT_BUCKET);
}

function buildSupabaseObjectUrl(fileName: string) {
  if (!SUPABASE_URL) return "";
  const objectPath = ["uploads", fileName].map((segment) => encodeURIComponent(segment)).join("/");
  return `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(SUPABASE_ASSISTANT_BUCKET)}/${objectPath}`;
}

export async function saveAssistantUpload(
  fileName: string,
  buffer: Buffer,
  contentType: string
) {
  if (canUseSupabaseStorage()) {
    const body = new Uint8Array(buffer);
    const response = await fetch(buildSupabaseObjectUrl(fileName), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY || "",
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload Supabase esuat: ${response.status} ${errText}`);
    }
    return;
  }

  const dir = ensureAssistantUploadDir();
  fs.writeFileSync(path.join(dir, fileName), buffer);
}

export async function readAssistantUpload(fileName: string) {
  if (canUseSupabaseStorage()) {
    const response = await fetch(buildSupabaseObjectUrl(fileName), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY || "",
      },
      cache: "no-store",
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Read Supabase esuat: ${response.status} ${errText}`);
    }
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
  }

  const filePath = getAssistantUploadPath(fileName);
  if (!fs.existsSync(filePath)) return null;
  return {
    buffer: fs.readFileSync(filePath),
    contentType: "application/octet-stream",
  };
}
