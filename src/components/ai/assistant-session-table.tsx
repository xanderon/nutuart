import type { AssistantSession } from "@/lib/assistant-leads-store";

type Props = {
  sessions: AssistantSession[];
};

export function AssistantSessionTable({ sessions }: Props) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/45">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[color:var(--color-elevated)]/70 text-left text-xs uppercase tracking-[0.18em] text-muted">
            <tr>
              <th className="px-4 py-3">Sesiune</th>
              <th className="px-4 py-3">Pagina</th>
              <th className="px-4 py-3">Rezumat</th>
              <th className="px-4 py-3">Ultimul mesaj</th>
              <th className="px-4 py-3">Poze</th>
              <th className="px-4 py-3">Stare</th>
              <th className="px-4 py-3">Actualizat</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length ? (
              sessions.map((session) => (
                <tr key={session.sessionId} className="border-t border-[color:var(--color-outline)]">
                  <td className="px-4 py-3 font-mono text-xs">{session.sessionId}</td>
                  <td className="px-4 py-3">{session.page}</td>
                  <td className="max-w-[320px] px-4 py-3 text-xs text-muted">{session.summary}</td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-muted">
                    {session.lastUserMessage || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {session.imageUrls.length ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted">{session.imageUrls.length} imagine(i)</p>
                        {session.imageUrls.slice(0, 2).map((imageUrl) => (
                          <a
                            key={imageUrl}
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
                  <td className="px-4 py-3 text-xs">
                    {session.forwarded ? "Forwarded" : session.leadReady ? "Ready" : "In chat"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(session.updatedAt).toLocaleString("ro-RO")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={7}>
                  Nu exista sesiuni inca.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
