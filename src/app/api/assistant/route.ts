import { NextResponse } from "next/server";
import { buildKnowledgeContext } from "@/data/ai-knowledge";

type ChatRole = "user" | "assistant";
type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AssistantPayload = {
  messages?: ChatMessage[];
  page?: string;
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4.1-mini";

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
      content: item.content.trim().slice(0, 1500),
    }))
    .slice(-12);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssistantPayload;
  const messages = normalizeMessages(body.messages);
  const page = typeof body.page === "string" ? body.page : "unknown";

  const latestUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "Trimite o întrebare pentru a primi răspuns." },
      { status: 400 }
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Asistentul nu este configurat încă. Lipseste OPENAI_API_KEY în variabilele de mediu.",
      },
      { status: 503 }
    );
  }

  const systemPrompt = [
    "Numele tau este Marcelino, asistentul AI al site-ului NutuArt.",
    "Raspunzi in romana, scurt, clar, prietenos si natural.",
    "Nu fii agresiv comercial; ofera idei si ghidare.",
    "Dupa un raspuns util, adauga o intrebare scurta de clarificare cand are sens.",
    "Foloseste doar informatia din contextul intern.",
    "Daca informatia lipseste, spune clar ce lipseste si recomanda contact direct la marcelnutu@yahoo.com sau +40 721 383 668.",
    "Nu inventa preturi, termene ferme, disponibilitate sau date neverificate.",
    `Context pagină curentă: ${page}`,
    "",
    buildKnowledgeContext(),
  ].join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Assistant API upstream error", response.status, errorText);
      return NextResponse.json(
        { error: "Asistentul este momentan indisponibil. Încearcă din nou." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Nu am putut genera un răspuns acum." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Assistant route error", error);
    return NextResponse.json(
      { error: "A apărut o eroare la asistent." },
      { status: 500 }
    );
  }
}
