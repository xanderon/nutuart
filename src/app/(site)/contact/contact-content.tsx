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
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 pb-6 pt-11 sm:space-y-6 sm:px-6 sm:pb-9 sm:pt-5 lg:px-8 lg:pt-6">
      <header className="space-y-1.5 text-center sm:space-y-2">
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">Contact</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Lucrări decorative pentru spații comerciale și rezidențiale.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-3 sm:gap-5 sm:p-8">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Email</p>
          <p className="font-display text-base font-semibold leading-snug text-foreground sm:text-3xl">
            <SafeContactText value={publicEmailValue} />
          </p>
          <p className="hidden text-xs text-muted sm:block">Răspundem în cel mai scurt timp.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Telefon & WhatsApp
          </p>
          <p className="font-display text-base font-semibold leading-snug text-foreground sm:text-3xl">
            <SafeContactText value={publicPhoneValue} />
          </p>
          <p className="hidden text-xs text-muted sm:block">Poți suna sau trimite mesaj direct.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
        <Image
          src="/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 05_29_34 PM.png"
          alt="Nuțu Marcel Marius la lucru în atelier"
          width={1400}
          height={900}
          className="h-auto w-full object-contain"
          priority
        />
      </section>
    </div>
  );
}
