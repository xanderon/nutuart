import Link from "next/link";

const footerLinks = [
  {
    title: "Descoperă",
    items: [
      { label: "Artistul", href: "/artist" },
      { label: "Procesul de creație", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--color-outline)] bg-[color:color-mix(in srgb,var(--color-background) 88%,transparent)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            NutuArt
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Geamuri sablate, vitralii și autocolante decorative create la comandă.
            Realizăm piese unicat și proiecte pentru spații rezidențiale sau corporate.
          </p>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {group.title}
            </p>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="transition-colors duration-150 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[color:var(--color-outline)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {year} NutuArt • Nuțu Marcel Marius.</p>
          <p className="tracking-[0.3em] uppercase">
            Creație • Sticlă • Lumină
          </p>
        </div>
      </div>
    </footer>
  );
}
