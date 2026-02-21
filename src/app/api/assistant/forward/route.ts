import { NextResponse } from "next/server";
import { buildLeadDraft } from "@/lib/assistant-lead-signals";
import {
  buildRequestId,
  createLead,
  getSessionById,
  markSessionForwarded,
} from "@/lib/assistant-leads-store";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ForwardPayload = {
  page?: string;
  messages?: ChatMessage[];
  contactType?: "email" | "phone";
  contactValue?: string;
  sessionId?: string;
};

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item): item is ChatMessage => {
      if (!item || typeof item !== "object") return false;
      const role = (item as ChatMessage).role;
      const content = (item as ChatMessage).content;
      return (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      );
    })
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 2000),
    }))
    .slice(-30);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^[+\d][\d\s()-]{7,}$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ForwardPayload;
  const page = typeof body.page === "string" ? body.page : "unknown";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim() !== ""
      ? body.sessionId.trim()
      : "anonymous";
  const messages = normalizeMessages(body.messages);
  const contactType = body.contactType;
  const contactValue = (body.contactValue ?? "").trim();

  if (!messages.length) {
    return NextResponse.json({ error: "Nu exista conversatie de trimis." }, { status: 400 });
  }

  if (contactType !== "email" && contactType !== "phone") {
    return NextResponse.json(
      { error: "Alege email sau telefon pentru contact." },
      { status: 400 }
    );
  }

  if (!contactValue) {
    return NextResponse.json({ error: "Completeaza datele de contact." }, { status: 400 });
  }

  if (contactType === "email" && !isValidEmail(contactValue)) {
    return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  }

  if (contactType === "phone" && !isValidPhone(contactValue)) {
    return NextResponse.json({ error: "Telefon invalid." }, { status: 400 });
  }

  const draft = buildLeadDraft(messages);
  const requestId = buildRequestId(draft.projectType);
  const session = getSessionById(sessionId);

  createLead({
    requestId,
    createdAt: new Date().toISOString(),
    page,
    status: "NEW",
    sessionId,
    imageUrls: session?.imageUrls ?? [],
    contactType,
    contactValue,
    transcript: messages,
    ...draft,
  });
  markSessionForwarded(sessionId, requestId);

  return NextResponse.json({
    ok: true,
    requestId,
    confirmation:
      `Multumesc! Am trimis cererea. Numar solicitare: ${requestId}. Revenim de obicei in 24–48 de ore. Daca vrei sa verifici mai tarziu, imi poti scrie: Status ${requestId}`,
  });
}
