"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const publicEmail = { user: "marcelnutu", domain: "yahoo.com" };
const publicPhone = { prefix: "+40", number: "721383668" };

function SafeContactText({ value }: { value: string }) {
  const [revealed, setRevealed] = useState("");

  useEffect(() => {
    setRevealed(value);
  }, [value]);

  return <span aria-label="contact">{revealed || "..."}</span>;
}

export function ContactContent() {
  const publicEmailValue = useMemo(
    () => `${publicEmail.user}@${publicEmail.domain}`,
    []
  );
  const publicPhoneValue = useMemo(
    () => `${publicPhone.prefix}${publicPhone.number}`,
    []
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Contact</p>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Contact direct
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted">
          Pentru proiecte noi, estimări sau detalii tehnice, ne poți contacta
          direct prin email sau telefon.
        </p>
      </header>

      <section className="grid gap-6 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-6 sm:grid-cols-2 sm:p-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Email</p>
          <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            <SafeContactText value={publicEmailValue} />
          </p>
          <p className="text-xs text-muted">Răspundem în cel mai scurt timp.</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Telefon & WhatsApp
          </p>
          <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
            <SafeContactText value={publicPhoneValue} />
          </p>
          <p className="text-xs text-muted">Poți suna sau trimite mesaj direct.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
        <Image
          src="/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 05_29_34 PM.png"
          alt="Nuțu Marcel Marius la lucru în atelier"
          width={1400}
          height={900}
          className="h-full w-full object-cover"
          priority
        />
      </section>
    </div>
  );
}
