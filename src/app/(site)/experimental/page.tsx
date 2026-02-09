import Image from "next/image";
import Link from "next/link";

export default function ExperimentalPage() {
  return (
    <div className="bg-[#fcfcfd] text-[#111827]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-black/5 bg-white px-5 py-7 shadow-[0_30px_80px_-60px_rgba(14,24,39,0.35)] sm:px-8">
          <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#64748b]">
            Experimental Feed
          </p>
          <h1 className="mt-3 max-w-xl text-3xl leading-tight text-[#0f172a] sm:text-5xl">
            Sticla. Lumina. Cadru curat.
          </h1>
        </section>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-black/5 bg-white">
          <div className="relative aspect-[16/11] sm:aspect-[16/9]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
              priority
            />
          </div>
        </section>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-transparent">
          <div className="relative aspect-[16/7] sm:aspect-[16/6] [mask-image:radial-gradient(125%_100%_at_50%_50%,black_66%,transparent_100%)]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#fcfcfd_0%,transparent_9%,transparent_91%,#fcfcfd_100%),linear-gradient(to_bottom,#fcfcfd_0%,transparent_14%,transparent_90%,#fcfcfd_100%)]" />
        </section>

        <section className="mt-10 border-t border-black/6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:bg-black hover:text-white"
            >
              Inapoi la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/10 px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:border-black"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
