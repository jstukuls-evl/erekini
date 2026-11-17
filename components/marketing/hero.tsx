import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-5rem)] flex-col justify-end overflow-hidden px-6 pb-16 pt-10 md:px-10 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(12, 42, 38, 0.55), rgba(12, 42, 38, 0.15) 45%, rgba(244, 241, 232, 0.2)), url('/hero-invoice.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="mx-auto w-full max-w-5xl animate-[fade-up_0.8s_ease_both]">
        <p className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl">
          erekini
        </p>
        <h1 className="mt-6 max-w-2xl text-2xl font-medium leading-snug text-white/95 sm:text-3xl">
          Latvijas e-rēķini bez smaga ERP
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
          Izveidojiet atbilstošus rēķinus, sagatavojiet EN 16931 XML un sūtiet
          B2B / B2G klientiem — skaidri un ātri.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup">
            <Button size="lg">Izveidot kontu</Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              Skatīt cenas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
