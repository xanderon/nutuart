import { NextResponse } from "next/server";
import { buildKnowledgeContext } from "@/data/ai-knowledge";
import {
  buildLeadDraft,
  isHumanHandoffIntent,
  isLeadReady,
  leadInfoCount,
} from "@/lib/assistant-lead-signals";
import {
  getLeadByRequestId,
  type LeadStatus,
  upsertSession,
} from "@/lib/assistant-leads-store";

type ChatRole = "user" | "assistant";
type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AssistantPayload = {
  messages?: ChatMessage[];
  page?: string;
  sessionId?: string;
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
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim() !== ""
      ? body.sessionId.trim()
      : "anonymous";

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

  const requestIdMatch = latestUserMessage.content.match(/\b([MGA]-\d{4})\b/i);
  const draft = buildLeadDraft(messages);
  const infoCount = leadInfoCount(messages);
  const leadReadyFromSignals = isLeadReady(messages);
  const latestUserContent = latestUserMessage.content || "";
  const handoffIntent = isHumanHandoffIntent(messages);
  const leadReadyNow = leadReadyFromSignals || (handoffIntent && infoCount >= 2);

  upsertSession({
    sessionId,
    page,
    messageCount: messages.length,
    lastUserMessage: latestUserContent.slice(0, 400),
    leadReady: leadReadyNow,
    draft,
  });

  if (requestIdMatch) {
    const requestId = requestIdMatch[1].toUpperCase();
    const lead = getLeadByRequestId(requestId);

    if (!lead) {
      return NextResponse.json({
        reply:
          `Nu gasesc o solicitare cu ID ${requestId}. Verifica, te rog, formatul (ex: M-4821).`,
        leadReady: false,
        leadDraft: draft,
      });
    }

    const statusText = statusMessage(lead.status);
    return NextResponse.json({
      reply: `Status ${requestId}: ${statusText}`,
      leadReady: false,
      leadDraft: draft,
    });
  }

  if (handoffIntent) {
    if (infoCount >= 2) {
      return NextResponse.json({
        reply:
          "Sigur. Pot trimite mai departe detaliile discutate pana acum, ca sa nu mai fie nevoie sa le explici din nou. Ai prefera sa fii contactat pe email sau telefon?",
        leadReady: true,
        leadDraft: draft,
      });
    }

    return NextResponse.json({
      reply:
        "Sigur. Pot sa te conectez direct cu artistul. Ca sa trimit mai departe util, spune-mi te rog 1-2 detalii (tipul piesei si dimensiunea aproximativa), apoi iti cer email sau telefon.",
      leadReady: false,
      leadDraft: draft,
    });
  }

  const systemPrompt = [
    "Numele tau este Marcelino, asistentul AI al site-ului NutuArt.",
    "Raspunzi in romana, scurt, clar, prietenos si natural.",
    "Nu fii agresiv comercial; ofera idei si ghidare.",
    "Pune cel mult o intrebare pe raspuns si maxim 2-3 intrebari de clarificare pe intreaga conversatie.",
    "Dupa ce ai inteles pe scurt nevoia, propune contact direct sau trimitere cerere (Request ID).",
    "Foloseste doar informatia din contextul intern.",
    "Daca informatia lipseste, spune clar ce lipseste si recomanda contact direct la marcelnutu@yahoo.com sau +40 721 383 668.",
    "Nu inventa preturi, termene ferme, disponibilitate sau date neverificate.",
    "Nu promite ca trimiti emailuri, imagini, oferte, modele sau variante concrete.",
    "Nu cere buget orientativ.",
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

    return NextResponse.json({
      reply: enforceAssistantPolicy(reply),
      leadReady: leadReadyNow,
      leadDraft: draft,
    });
  } catch (error) {
    console.error("Assistant route error", error);
    return NextResponse.json(
      { error: "A apărut o eroare la asistent." },
      { status: 500 }
    );
  }
}

function enforceAssistantPolicy(reply: string) {
  let text = reply;

  const replacements: Array<[RegExp, string]> = [
    [
      /\b(pot|iti pot|îți pot|o sa|voi)\s+(sa\s+)?(trimite|trimitem|trimit)\b/gi,
      "pot sa sugerez",
    ],
    [/\bvrei sa le primesti pe email\??/gi, "vrei sa inregistram o cerere catre artist?"],
    [/\bai un buget orientativ\??/gi, "daca vrei, spune-mi tipul piesei si dimensiunea"],
    [/\biti trimit\b/gi, "iti pot sugera"],
  ];

  for (const [pattern, value] of replacements) {
    text = text.replace(pattern, value);
  }

  const questions = text.match(/\?/g)?.length ?? 0;
  if (questions > 1) {
    const firstQuestionIdx = text.indexOf("?");
    if (firstQuestionIdx >= 0) {
      text = `${text.slice(0, firstQuestionIdx + 1)}`.trim();
    }
  }

  return text;
}

function statusMessage(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "cererea ta a fost primita si urmeaza sa fie analizata. De obicei revenim in 24–48 de ore.";
    case "SEEN":
      return "cererea ta este in curs de analiza. Vei primi un raspuns in curand.";
    case "IN_PROGRESS":
      return "se lucreaza la o propunere pentru tine. Revenim cat mai curand.";
    case "REPLIED":
      return "ti-am trimis deja un raspuns. Te rog verifica emailul sau mesajele.";
    case "CLOSED":
      return "cererea este inchisa. Daca vrei, putem deschide una noua pe baza altor detalii.";
    default:
      return "status indisponibil momentan.";
  }
}
