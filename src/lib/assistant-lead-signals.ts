type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LeadDraft = {
  projectType: string;
  dimensions: string;
  style: string;
  location: string;
  summary: string;
};

const typeKeywords: Array<[string, RegExp]> = [
  ["decor geam", /\b(geam|fereastra|usa|panou)\b/i],
  ["vitraliu", /\bvitrali/i],
  ["sablare", /\bsablat|sablare\b/i],
  ["cadou personalizat", /\bcadou\b/i],
  ["obiect decorativ", /\bdecor|vaza|piesa\b/i],
];

const styleKeywords: Array<[string, RegExp]> = [
  ["minimalist", /\bminimal/i],
  ["modern", /\bmodern/i],
  ["clasic", /\bclasic/i],
  ["floral", /\bfloral|floare\b/i],
  ["abstract", /\babstract/i],
];

const locationKeywords: Array<[string, RegExp]> = [
  ["living", /\bliving\b/i],
  ["dormitor", /\bdormitor\b/i],
  ["hol", /\bhol\b/i],
  ["bucatarie", /\bbucatar/i],
  ["baie", /\bbaie\b/i],
  ["birou", /\bbirou\b/i],
  ["spatiu comercial", /\bcomercial|cafenea|salon\b/i],
];

const intentRegex =
  /\b(vreau|as vrea|proiect|comanda|cat costa|pret|durata|termen|personalizat|pot sa fac)\b/i;
const humanHandoffRegex =
  /\b(vorbesc|vorbim|discut|discutam|om|persoana|operator|direct|sunat|contactat)\b/i;
const uncertainRegex =
  /\b(nu stiu|nu știu|nush|nu sunt sigur|nu sunt sigura|habar n-am|nu conteaza|nu contează)\b/i;

function firstMatch(text: string, rules: Array<[string, RegExp]>) {
  const match = rules.find(([, regex]) => regex.test(text));
  return match ? match[0] : "";
}

function extractDimensions(text: string) {
  const match = text.match(/\b\d{1,4}\s?(?:x|X|\*)\s?\d{1,4}(?:\s?(?:x|X|\*)\s?\d{1,4})?\b/);
  return match ? match[0].replace(/\*/g, "x") : "";
}

export function buildLeadDraft(messages: ChatMessage[]): LeadDraft {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" \n ");

  const projectType = firstMatch(userText, typeKeywords);
  const style = firstMatch(userText, styleKeywords);
  const location = firstMatch(userText, locationKeywords);
  const dimensions = extractDimensions(userText);

  const parts = [
    projectType && `Tip: ${projectType}`,
    location && `Locatie: ${location}`,
    dimensions && `Dimensiuni: ${dimensions}`,
    style && `Stil: ${style}`,
  ].filter(Boolean);

  return {
    projectType,
    location,
    dimensions,
    style,
    summary: parts.join(" | ") || "Cerere discutata in chat, fara detalii complete.",
  };
}

export function isLeadReady(messages: ChatMessage[]) {
  const userMessages = messages.filter((message) => message.role === "user");
  if (userMessages.length < 2) return false;

  const userText = userMessages.map((message) => message.content).join(" \n ");
  const draft = buildLeadDraft(messages);

  const infoCount = [draft.projectType, draft.location, draft.dimensions, draft.style].filter(
    Boolean
  ).length;
  const hasIntent = intentRegex.test(userText);

  return hasIntent && infoCount >= 2;
}

export function hasProjectIntent(messages: ChatMessage[]) {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" \n ");
  return intentRegex.test(userText);
}

export function leadInfoCount(messages: ChatMessage[]) {
  const draft = buildLeadDraft(messages);
  return [draft.projectType, draft.location, draft.dimensions, draft.style].filter(Boolean)
    .length;
}

export function isHumanHandoffIntent(messages: ChatMessage[]) {
  const latestUser = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUser) return false;
  return humanHandoffRegex.test(latestUser.content);
}

export function countUncertainReplies(messages: ChatMessage[]) {
  return messages.filter(
    (message) => message.role === "user" && uncertainRegex.test(message.content)
  ).length;
}

export function countAssistantQuestions(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role === "assistant")
    .reduce((total, message) => total + (message.content.match(/\?/g)?.length ?? 0), 0);
}
