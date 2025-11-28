"use client";

import { useEffect, useMemo, useState } from "react";

const publicEmail = { user: "marcelnutu", domain: "yahoo.com" };
const publicPhone = { prefix: "+40", number: "721383668" };

function SafeContactText({ value }: { value: string }) {
  const [revealed, setRevealed] = useState("");

  useEffect(() => {
    // Set text only after hydration to reduce static scraping.
    setRevealed(value);
  }, [value]);

  return <span aria-label="contact">{revealed || "..."}</span>;
}

export function ContactContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const publicEmailValue = useMemo(
    () => `${publicEmail.user}@${publicEmail.domain}`,
    []
  );
  const publicPhoneValue = useMemo(
    () => `${publicPhone.prefix}${publicPhone.number}`,
    []
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email && !phone) {
      setError("Completează emailul sau telefonul pentru a continua.");
      return;
    }

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Nu am putut trimite mesajul. Încearcă din nou.");
      }

      setSuccess("Mesaj trimis. Mulțumim! Revenim cât de repede.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eroare la trimitere.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Contact</p>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Trimite-ne câteva detalii și revenim rapid.
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted">
          Spune-ne pe scurt despre proiect: spațiu, dimensiuni, termene și
          preferințe. Răspundem cu următorii pași și opțiuni de colaborare.
        </p>
      </header>

      <section className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 p-8 shadow-[var(--shadow-soft)] sm:p-10">
        <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:col-span-1">
            <label
              htmlFor="name"
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Nume
            </label>
            <input
              id="name"
              name="name"
              placeholder="Numele complet"
              className="w-full rounded-full border border-[color:var(--color-outline)] bg-transparent px-5 py-3 text-sm text-foreground outline-none transition focus:border-[color:var(--color-accent)]"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="adresa@email.com"
              className="w-full rounded-full border border-[color:var(--color-outline)] bg-transparent px-5 py-3 text-sm text-foreground outline-none transition focus:border-[color:var(--color-accent)]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-1">
            <label
              htmlFor="phone"
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Telefon
            </label>
            <input
              id="phone"
              name="phone"
              placeholder="+40..."
              className="w-full rounded-full border border-[color:var(--color-outline)] bg-transparent px-5 py-3 text-sm text-foreground outline-none transition focus:border-[color:var(--color-accent)]"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label
              htmlFor="message"
              className="text-xs uppercase tracking-[0.3em] text-muted"
            >
              Mesaj
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Spune-ne despre spațiu, dimensiuni, termene și preferințe cromatice."
              className="min-h-[160px] w-full rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-transparent px-5 py-4 text-sm text-foreground outline-none transition focus:border-[color:var(--color-accent)]"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>
          {(error || success) && (
            <div className="sm:col-span-2 space-y-1">
              {error && (
                <p className="text-sm text-[color:var(--color-accent-strong)]">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-[color:var(--color-accent)]">{success}</p>
              )}
            </div>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--color-accent-strong)] px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--color-background)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {submitting ? "Se trimite..." : "Trimite mesajul"}
            </button>
            <p className="mt-2 text-xs text-muted">
              Completează emailul sau telefonul ca să putem răspunde.
            </p>
          </div>
        </form>
      </section>

      <section className="grid gap-6 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-6 sm:grid-cols-2 sm:p-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Email</p>
          <p className="font-display text-lg text-foreground">
            <SafeContactText value={publicEmailValue} />
          </p>
          <p className="text-xs text-muted">
            Scrie-ne despre proiectul tău; răspundem în scurt timp.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Telefon & WhatsApp
          </p>
          <p className="font-display text-lg text-foreground">
            <SafeContactText value={publicPhoneValue} />
          </p>
          <p className="text-xs text-muted">
            Dacă preferi, sună sau trimite un mesaj direct.
          </p>
        </div>
      </section>
    </div>
  );
}
