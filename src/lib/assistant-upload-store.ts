import fs from "node:fs";
import path from "node:path";

export const MAX_ASSISTANT_UPLOAD_SIZE = 4 * 1024 * 1024;

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
