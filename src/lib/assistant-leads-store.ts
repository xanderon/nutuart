import fs from "node:fs";
import path from "node:path";
import type { LeadDraft } from "./assistant-lead-signals";

export type AssistantLead = LeadDraft & {
  requestId: string;
  createdAt: string;
  page: string;
  status: LeadStatus;
  contactType: "email" | "phone";
  contactValue: string;
  transcript: Array<{ role: "user" | "assistant"; content: string }>;
};

export type LeadStatus = "NEW" | "SEEN" | "IN_PROGRESS" | "REPLIED" | "CLOSED";

type StoreShape = {
  leads: AssistantLead[];
};

function getStorePath() {
  if (process.env.VERCEL) {
    return "/tmp/marcelino-leads.json";
  }
  return path.join(process.cwd(), ".data", "marcelino-leads.json");
}

function ensureStore() {
  const filePath = getStorePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ leads: [] } satisfies StoreShape, null, 2));
  }
  return filePath;
}

function readStore(): StoreShape {
  const filePath = ensureStore();
  const raw = fs.readFileSync(filePath, "utf-8");
  try {
    const parsed = JSON.parse(raw) as StoreShape;
    return {
      leads: Array.isArray(parsed.leads)
        ? parsed.leads.map((lead) => ({
            ...lead,
            status: (lead as AssistantLead).status || "NEW",
          }))
        : [],
    };
  } catch {
    return { leads: [] };
  }
}

function writeStore(data: StoreShape) {
  const filePath = ensureStore();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function randomFourDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function buildRequestId(projectType: string) {
  const normalized = projectType.toLowerCase();
  if (normalized.includes("cadou")) return `G-${randomFourDigits()}`;
  if (normalized.includes("arta") || normalized.includes("decorativ")) return `A-${randomFourDigits()}`;
  return `M-${randomFourDigits()}`;
}

export function createLead(lead: AssistantLead) {
  const store = readStore();
  store.leads.unshift(lead);
  writeStore(store);
  return lead;
}

export function listLeads() {
  const store = readStore();
  return store.leads;
}

export function getLeadByRequestId(requestId: string) {
  const store = readStore();
  return store.leads.find((lead) => lead.requestId.toUpperCase() === requestId.toUpperCase());
}

export function updateLeadStatus(requestId: string, status: LeadStatus) {
  const store = readStore();
  const index = store.leads.findIndex(
    (lead) => lead.requestId.toUpperCase() === requestId.toUpperCase()
  );
  if (index < 0) return null;
  const next = { ...store.leads[index], status };
  store.leads[index] = next;
  writeStore(store);
  return next;
}

export function computeDailyOverview(leads: AssistantLead[]) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLeads = leads.filter((lead) => lead.createdAt.startsWith(today));

  const byType = new Map<string, number>();
  const byStyle = new Map<string, number>();
  const byDimensions = new Map<string, number>();

  for (const lead of todayLeads) {
    if (lead.projectType) {
      byType.set(lead.projectType, (byType.get(lead.projectType) ?? 0) + 1);
    }
    if (lead.style) {
      byStyle.set(lead.style, (byStyle.get(lead.style) ?? 0) + 1);
    }
    if (lead.dimensions) {
      byDimensions.set(lead.dimensions, (byDimensions.get(lead.dimensions) ?? 0) + 1);
    }
  }

  const top = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return {
    today,
    totalTodayLeads: todayLeads.length,
    topTypes: top(byType),
    topStyles: top(byStyle),
    topDimensions: top(byDimensions),
  };
}
