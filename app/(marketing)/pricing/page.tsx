import type { Metadata } from "next";

import { PricingTable } from "@/components/marketing/pricing-table";

export const metadata: Metadata = {
  title: "Cenas",
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
      <h1 className="font-[family-name:var(--font-display)] text-5xl text-[var(--ink)]">
        Cenas
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">
        Vienkārši plāni Latvijas MVU un pašnodarbinātajiem. Norēķinu integrācija
        (Stripe) — vēlākā fāzē.
      </p>
      <div className="mt-12">
        <PricingTable />
      </div>
    </section>
  );
}
