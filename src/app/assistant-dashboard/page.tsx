import type { Metadata } from "next";
import { computeDailyOverview, listLeads } from "@/lib/assistant-leads-store";
import { AssistantDashboardTable } from "@/components/ai/assistant-dashboard-table";

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

      <AssistantDashboardTable initialLeads={leads} />
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
