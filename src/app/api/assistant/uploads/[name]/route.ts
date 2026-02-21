import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAssistantUploadPath } from "@/lib/assistant-upload-store";

export const runtime = "nodejs";

const mimeByExtension: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

type Params = {
  params: Promise<{ name: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { name } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Nume fisier invalid." }, { status: 400 });
  }

  const filePath = getAssistantUploadPath(name);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Imaginea nu a fost gasita." }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const extension = path.extname(name).toLowerCase();
  const contentType = mimeByExtension[extension] || "application/octet-stream";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
