import { NextResponse } from "next/server";
import { listLeads, updateLeadStatus, type LeadStatus } from "@/lib/assistant-leads-store";

type UpdatePayload = {
  requestId?: string;
  status?: LeadStatus;
};

const allowedStatuses: LeadStatus[] = [
  "NEW",
  "SEEN",
  "IN_PROGRESS",
  "REPLIED",
  "CLOSED",
];

export async function GET() {
  return NextResponse.json({ leads: listLeads() });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as UpdatePayload;
  const requestId = (body.requestId ?? "").trim();
  const status = body.status;

  if (!requestId || !status || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Payload invalid pentru update status." },
      { status: 400 }
    );
  }

  const updated = updateLeadStatus(requestId, status);
  if (!updated) {
    return NextResponse.json({ error: "Cererea nu a fost gasita." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated });
}
