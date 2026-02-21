import { NextResponse } from "next/server";
import { readAssistantUpload } from "@/lib/assistant-upload-store";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ name: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { name } = await params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Nume fisier invalid." }, { status: 400 });
  }

  try {
    const file = await readAssistantUpload(name);
    if (!file) {
      return NextResponse.json({ error: "Imaginea nu a fost gasita." }, { status: 404 });
    }

    return new NextResponse(file.buffer, {
      status: 200,
      headers: {
        "Content-Type": file.contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Assistant upload read error", error);
    return NextResponse.json({ error: "Nu am putut citi imaginea." }, { status: 500 });
  }
}
