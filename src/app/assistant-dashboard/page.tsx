import type { Metadata } from "next";
import { computeDailyOverview, listLeads } from "@/lib/assistant-leads-store";

export const metadata: Metadata = {
  title: "Assistant Dashboard",
  description: "Dashboard simplu pentru cererile preluate de Marcelino.",
};

export default function AssistantDashboardPage() {
  const leads = listLeads();
  const overview = computeDailyOverview(leads);

  const tldr = [
    `${overview.totalTodayLeads} cereri noi azi.`,
    overview.topTypes.length
      ? `Tipuri frecvente: ${overview.topTypes
          .map(([label, count]) => `${label} (${count})`)
          .join(", ")}.`
      : "Nu exista inca un tip dominant.",
    overview.topStyles.length
      ? `Stiluri cerute: ${overview.topStyles
          .map(([label, count]) => `${label} (${count})`)
          .join(", ")}.`
      : "Nu exista inca stiluri dominante.",
  ].join(" ");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Marcelino Dashboard</p>
        <h1 className="font-display text-3xl sm:text-4xl">Cereri din asistent</h1>
        <p className="text-sm text-muted">
          Pagina este deschisă momentan. Ulterior poți pune protecție cu email/parolă.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card title="Cererile de azi" value={String(overview.totalTodayLeads)} />
        <Card title="Total cereri" value={String(leads.length)} />
        <Card title="Data raport" value={overview.today} />
      </section>

      <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-muted">TL;DR</p>
        <p className="mt-3 text-sm leading-relaxed text-foreground">{tldr}</p>
      </section>

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/45">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[color:var(--color-elevated)]/70 text-left text-xs uppercase tracking-[0.18em] text-muted">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">Dimensiuni</th>
                <th className="px-4 py-3">Stil</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Creat</th>
              </tr>
            </thead>
            <tbody>
              {leads.length ? (
                leads.map((lead) => (
                  <tr key={lead.requestId} className="border-t border-[color:var(--color-outline)]">
                    <td className="px-4 py-3 font-semibold">{lead.requestId}</td>
                    <td className="px-4 py-3">{lead.projectType || "-"}</td>
                    <td className="px-4 py-3">{lead.dimensions || "-"}</td>
                    <td className="px-4 py-3">{lead.style || "-"}</td>
                    <td className="px-4 py-3">
                      {lead.contactType}: {lead.contactValue}
                    </td>
                    <td className="px-4 py-3">{new Date(lead.createdAt).toLocaleString("ro-RO")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-muted" colSpan={6}>
                    Nu exista cereri inca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
