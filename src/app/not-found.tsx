import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <span className="text-xs uppercase tracking-[0.35em] text-muted">404</span>
      <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
        Pagina nu a fost găsită.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        Linkul poate fi vechi sau incomplet. Poți reveni în galerie sau merge direct
        la pagina de contact.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[color:var(--color-accent-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-background)] transition duration-200 hover:-translate-y-0.5"
        >
          Galerie
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-[color:var(--color-outline)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-foreground transition duration-200 hover:-translate-y-0.5"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}

