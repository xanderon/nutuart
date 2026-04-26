import { NextResponse } from "next/server";
import { buildKnowledgeContext } from "@/data/ai-knowledge";
import {
  buildLeadDraft,
  countAssistantQuestions,
  countUncertainReplies,
  isHumanHandoffIntent,
  isLeadReady,
  leadInfoCount,
} from "@/lib/assistant-lead-signals";
import { getLeadByRequestId, type LeadStatus, upsertSession } from "@/lib/assistant-leads-store";
import { readAssistantUpload } from "@/lib/assistant-upload-store";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";
type ChatMessage = {
  role: ChatRole;
  content: string;
  attachments?: string[];
};

type AssistantPayload = {
  messages?: ChatMessage[];
  page?: string;
  sessionId?: string;
};

type LeadDraft = ReturnType<typeof buildLeadDraft>;
type StreamEvent =
  | { type: "meta"; leadReady: boolean; leadDraft: LeadDraft }
  | { type: "delta"; content: string }
  | { type: "replace"; content: string }
  | { type: "done" }
  | { type: "error"; error: string };

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4.1-mini";
const encoder = new TextEncoder();

function normalizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((item): item is ChatMessage => {
      if (!item || typeof item !== "object") return false;
      const role = (item as ChatMessage).role;
      const content = (item as ChatMessage).content;
      const attachments = (item as ChatMessage).attachments;
      const hasContent = typeof content === "string" && content.trim().length > 0;
      const hasAttachments =
        Array.isArray(attachments) &&
        attachments.some((attachment) => typeof attachment === "string" && attachment.trim());

      return (role === "user" || role === "assistant") && (hasContent || hasAttachments);
    })
    .map((item) => ({
      role: item.role,
      content: typeof item.content === "string" ? item.content.trim().slice(0, 2000) : "",
      attachments: Array.isArray(item.attachments)
        ? item.attachments
            .filter((attachment): attachment is string => typeof attachment === "string")
            .map((attachment) => attachment.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [],
    }))
    .slice(-16);
}

function sse(event: StreamEvent) {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

function streamResponse(run: (send: (event: StreamEvent) => void) => Promise<void>) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        const send = (event: StreamEvent) => controller.enqueue(sse(event));

        try {
          await run(send);
        } catch (error) {
          console.error("Assistant stream error", error);
          send({
            type: "error",
            error: error instanceof Error ? error.message : "A aparut o eroare la asistent.",
          });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    }
  );
}

async function streamSingleReply(options: {
  reply: string;
  leadReady: boolean;
  leadDraft: LeadDraft;
}) {
  return streamResponse(async (send) => {
    send({
      type: "meta",
      leadReady: options.leadReady,
      leadDraft: options.leadDraft,
    });
    send({ type: "replace", content: options.reply });
    send({ type: "done" });
  });
}

function extractUploadName(url: string) {
  const match = url.match(/\/api\/assistant\/uploads\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function buildImagePart(url: string) {
  const uploadName = extractUploadName(url);
  if (!uploadName) return null;

  const stored = await readAssistantUpload(uploadName);
  if (!stored) return null;

  return {
    type: "image_url" as const,
    image_url: {
      url: `data:${stored.contentType};base64,${stored.buffer.toString("base64")}`,
    },
  };
}

async function buildOpenAiMessages(messages: ChatMessage[]) {
  const openAiMessages: Array<{
    role: ChatRole | "system";
    content:
      | string
      | Array<
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } }
        >;
  }> = [];

  for (const message of messages) {
    if (message.role === "assistant" || !message.attachments?.length) {
      openAiMessages.push({
        role: message.role,
        content: message.content || "Continua conversatia.",
      });
      continue;
    }

    const imageParts = (
      await Promise.all(message.attachments.map((attachment) => buildImagePart(attachment)))
    ).filter(Boolean) as Array<{ type: "image_url"; image_url: { url: string } }>;

    if (!imageParts.length) {
      openAiMessages.push({
        role: message.role,
        content: message.content || "Am atasat o imagine de referinta.",
      });
      continue;
    }

    openAiMessages.push({
      role: message.role,
      content: [
        {
          type: "text",
          text:
            message.content ||
            "Analizeaza imaginea ca referinta pentru o piesa din sticla si raspunde in contextul site-ului.",
        },
        ...imageParts,
      ],
    });
  }

  return openAiMessages;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssistantPayload;
  const messages = normalizeMessages(body.messages);
  const page = typeof body.page === "string" ? body.page : "unknown";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim() !== ""
      ? body.sessionId.trim()
      : "anonymous";

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage) {
    return NextResponse.json(
      { error: "Trimite o intrebare sau o imagine pentru a primi raspuns." },
      { status: 400 }
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Asistentul nu este configurat inca. Lipseste OPENAI_API_KEY in variabilele de mediu.",
      },
      { status: 503 }
    );
  }

  const requestIdMatch = latestUserMessage.content.match(/\b([MGA]-\d{4})\b/i);
  const draft = buildLeadDraft(messages);
  const infoCount = leadInfoCount(messages);
  const leadReadyFromSignals = isLeadReady(messages);
  const latestUserContent =
    latestUserMessage.content || (latestUserMessage.attachments?.length ? "[imagine atasata]" : "");
  const handoffIntent = isHumanHandoffIntent(messages);
  const userMessageCount = messages.filter((message) => message.role === "user").length;
  const uncertainReplies = countUncertainReplies(messages);
  const assistantQuestionCount = countAssistantQuestions(messages);
  const earlyContactOffer = uncertainReplies >= 2 && userMessageCount >= 4;
  const tooManyClarifications = assistantQuestionCount >= 5 && userMessageCount >= 4;
  const lowProgressReminder = userMessageCount >= 7 && infoCount <= 1;
  const leadReadyNow =
    leadReadyFromSignals ||
    (handoffIntent && infoCount >= 1) ||
    (userMessageCount >= 4 && infoCount >= 2) ||
    earlyContactOffer ||
    tooManyClarifications ||
    lowProgressReminder;

  await upsertSession({
    sessionId,
    page,
    messageCount: messages.length,
    lastUserMessage: latestUserContent.slice(0, 400),
    leadReady: leadReadyNow,
    draft,
  });

  if (requestIdMatch) {
    const requestId = requestIdMatch[1].toUpperCase();
    const lead = await getLeadByRequestId(requestId);

    if (!lead) {
      return streamSingleReply({
        reply: `Nu gasesc o solicitare cu ID ${requestId}. Verifica, te rog, formatul (ex: M-4821).`,
        leadReady: false,
        leadDraft: draft,
      });
    }

    return streamSingleReply({
      reply: `Status ${requestId}: ${statusMessage(lead.status)}`,
      leadReady: false,
      leadDraft: draft,
    });
  }

  if (handoffIntent) {
    if (infoCount >= 1) {
      return streamSingleReply({
        reply:
          "Sigur. Pot pregati acum cererea pe baza a ceea ce am discutat, ca sa nu mai repeti detaliile. Daca vrei, lasa-mi emailul sau telefonul in formularul de mai jos.",
        leadReady: true,
        leadDraft: draft,
      });
    }

    return streamSingleReply({
      reply:
        "Sigur. Inainte sa trimit cererea, ajuta-ma cu un singur detaliu util: ce tip de piesa cauti sau unde va fi folosita?",
      leadReady: false,
      leadDraft: draft,
    });
  }

  if (earlyContactOffer || tooManyClarifications || lowProgressReminder) {
    return streamSingleReply({
      reply:
        "Putem continua aici, dar daca vrei varianta mai rapida pot trimite direct mai departe ce am discutat pana acum. Lasa emailul sau telefonul in formularul de mai jos, iar artistul revine cu detaliile potrivite.",
      leadReady: true,
      leadDraft: draft,
    });
  }

  const systemPrompt = [
    "Numele tau este Marcelino, asistentul AI al site-ului NutuArt.",
    "Raspunzi in romana, natural, clar si util.",
    "Rolul tau este sa ajuti vizitatorul sa inteleaga ce i s-ar potrivi si care este urmatorul pas.",
    "Daca utilizatorul trimite o imagine, descrie pe scurt ce observi relevant si leaga raspunsul de proiecte din sticla, vitralii, sablare sau decor personalizat.",
    "Preferi raspunsuri scurte sau medii, cu 0 sau 1 intrebare utila pe mesaj.",
    "Nu bloca discutia prea devreme cu cereri de contact. Contactul este o optiune utila, nu final obligatoriu.",
    "Propune contact direct sau cerere doar cand utilizatorul cere pret exact, termen exact, oferta finala, montaj, discutie directa sau dupa mai multe mesaje fara progres.",
    "Cand ai inteles pe scurt nevoia, ofera 2-3 directii simple si apoi intreaba daca vrea sa continue in chat sau sa lase o cerere.",
    "Mesaj standard de contact: Email: marcelnutu@yahoo.com | Telefon / WhatsApp: +40 721 383 668.",
    "Foloseste doar informatia din contextul intern.",
    "Daca informatia lipseste, spune clar ce lipseste si cere un detaliu scurt.",
    "Nu inventa preturi, termene ferme, disponibilitate sau date neverificate.",
    "Nu promite ca trimiti emailuri, imagini, oferte sau variante finale.",
    "Nu cere buget orientativ.",
    `Context pagina curenta: ${page}`,
    "",
    buildKnowledgeContext(),
  ].join("\n");

  const openAiMessages = await buildOpenAiMessages(messages);

  return streamResponse(async (send) => {
    send({
      type: "meta",
      leadReady: leadReadyNow,
      leadDraft: draft,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.45,
        max_tokens: 260,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...openAiMessages],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Assistant API upstream error", response.status, errorText);
      throw new Error("Asistentul este momentan indisponibil. Incearca din nou.");
    }

    if (!response.body) {
      throw new Error("Asistentul nu a returnat un flux de raspuns.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullReply = "";

    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;

        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;

        const data = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };

        const delta = data.choices?.[0]?.delta?.content;
        if (!delta) continue;

        fullReply += delta;
        send({ type: "delta", content: delta });
      }

      if (done) break;
    }

    const finalReply = enforceAssistantPolicy(fullReply.trim());

    if (!finalReply) {
      throw new Error("Nu am putut genera un raspuns acum.");
    }

    if (finalReply !== fullReply.trim()) {
      send({ type: "replace", content: finalReply });
    }

    send({ type: "done" });
  });
}

function enforceAssistantPolicy(reply: string) {
  let text = reply;

  const forbiddenPromiseRegex =
    /\b(iti\s+trimit|pot\s+sa\s+trimit|o\s+sa\s+trimit|voi\s+trimite)\b[\s\S]{0,80}\b(email|e-mail|model|modele|exempl|poza|imagine|fisier)\b/i;
  if (forbiddenPromiseRegex.test(text)) {
    return "Pot sa-ti ofer idei generale aici. Pentru exemple concrete sau discutie aplicata, poti continua in chat ori poti contacta direct la marcelnutu@yahoo.com / +40 721 383 668.";
  }

  const replacements: Array<[RegExp, string]> = [
    [
      /\b(pot|iti pot|o sa|voi)\s+(sa\s+)?(trimite|trimitem|trimit)\b/gi,
      "pot sa pregatesc",
    ],
    [/\bvrei sa le primesti pe email\??/gi, "daca vrei, putem lasa o cerere"],
    [/\bai un buget orientativ\??/gi, "daca vrei, spune-mi tipul piesei si dimensiunea"],
    [/\biti trimit\b/gi, "iti pot propune"],
  ];

  for (const [pattern, value] of replacements) {
    text = text.replace(pattern, value);
  }

  const questions = text.match(/\?/g)?.length ?? 0;
  if (questions > 1) {
    const firstQuestionIdx = text.indexOf("?");
    if (firstQuestionIdx >= 0) {
      text = text.slice(0, firstQuestionIdx + 1).trim();
    }
  }

  return text;
}

function statusMessage(status: LeadStatus) {
  switch (status) {
    case "NEW":
      return "cererea ta a fost primita si urmeaza sa fie analizata. De obicei revenim in 24-48 de ore.";
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
