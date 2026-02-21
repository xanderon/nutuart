"use client";

import { useMemo, useState } from "react";
import type { AssistantLead, LeadStatus } from "@/lib/assistant-leads-store";

type Props = {
  initialLeads: AssistantLead[];
};

const statuses: LeadStatus[] = ["NEW", "SEEN", "IN_PROGRESS", "REPLIED", "CLOSED"];

export function AssistantDashboardTable({ initialLeads }: Props) {
  const [leads, setLeads] = useState<AssistantLead[]>(initialLeads);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedLeads = useMemo(
    () =>
      [...leads].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [leads]
  );

  const updateStatus = async (requestId: string, status: LeadStatus) => {
    setSavingId(requestId);
    setError(null);
    try {
      const response = await fetch("/api/assistant/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Nu am putut salva statusul.");
      }

      setLeads((prev) =>
        prev.map((lead) => (lead.requestId === requestId ? { ...lead, status } : lead))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la salvare.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/45">
      {error ? (
        <p className="border-b border-[color:var(--color-outline)] px-4 py-2 text-xs text-[color:var(--color-accent-strong)]">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--color-elevated)]/70 text-left text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Dimensiuni</th>
              <th className="px-4 py-3">Stil</th>
              <th className="px-4 py-3">Poze</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Creat</th>
            </tr>
          </thead>
          <tbody>
            {sortedLeads.length ? (
              sortedLeads.map((lead) => (
                <tr key={lead.requestId} className="border-t border-[color:var(--color-outline)]">
                  <td className="px-4 py-3 font-semibold">{lead.requestId}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status || "NEW"}
                      onChange={(event) =>
                        void updateStatus(lead.requestId, event.target.value as LeadStatus)
                      }
                      disabled={savingId === lead.requestId}
                      className="rounded-md border border-[color:var(--color-outline)] bg-transparent px-2 py-1 text-xs"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{lead.projectType || "-"}</td>
                  <td className="px-4 py-3">{lead.dimensions || "-"}</td>
                  <td className="px-4 py-3">{lead.style || "-"}</td>
                  <td className="px-4 py-3">
                    {lead.imageUrls?.length ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">{lead.imageUrls.length} imagine(i)</p>
                        {lead.imageUrls.slice(0, 2).map((imageUrl) => (
                          <a
                            key={`${lead.requestId}-${imageUrl}`}
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-[color:var(--color-accent-strong)] underline underline-offset-2"
                          >
                            Deschide poza
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.contactType}: {lead.contactValue}
                  </td>
                  <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleString("ro-RO")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={8}>
                  Nu exista cereri inca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
