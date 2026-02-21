import path from "node:path";
import { NextResponse } from "next/server";
import { addSessionImage } from "@/lib/assistant-leads-store";
import {
  MAX_ASSISTANT_UPLOAD_SIZE,
  saveAssistantUpload,
} from "@/lib/assistant-upload-store";

export const runtime = "nodejs";

const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic", ".heif"]);

function safeFileName(originalName: string) {
  const extension = path.extname(originalName || "").toLowerCase();
  const ext = allowedExtensions.has(extension) ? extension : ".jpg";
  const token = Math.random().toString(36).slice(2, 9);
  return `${Date.now()}-${token}${ext}`;
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Payload invalid." }, { status: 400 });
  }

  const sessionIdRaw = formData.get("sessionId");
  const sessionId = typeof sessionIdRaw === "string" && sessionIdRaw.trim() ? sessionIdRaw : "anonymous";

  const fileValue = formData.get("file");
  if (!(fileValue instanceof File)) {
    return NextResponse.json({ error: "Nu ai selectat o imagine." }, { status: 400 });
  }

  if (!fileValue.type.startsWith("image/")) {
    return NextResponse.json({ error: "Poti incarca doar imagini." }, { status: 400 });
  }

  if (fileValue.size > MAX_ASSISTANT_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: "Imaginea depaseste limita de 4MB." },
      { status: 400 }
    );
  }

  const fileName = safeFileName(fileValue.name);
  const buffer = Buffer.from(await fileValue.arrayBuffer());
  const contentType = fileValue.type || mimeFromExtension(path.extname(fileName).toLowerCase());

  await saveAssistantUpload(fileName, buffer, contentType);
  const imageUrl = `/api/assistant/uploads/${fileName}`;
  await addSessionImage(sessionId, imageUrl);

  return NextResponse.json({
    ok: true,
    url: imageUrl,
    fileName,
    size: fileValue.size,
  });
}

function mimeFromExtension(extension: string) {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    default:
      return "application/octet-stream";
  }
}
