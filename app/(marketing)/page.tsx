import { Hero } from "@/components/marketing/hero";
import { PricingTable } from "@/components/marketing/pricing-table";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-5xl px-6 py-20 md:px-10">
        <h2 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Cenas
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          Sāciet bezmaksas. Paplašiniet, kad nepieciešams XML eksports un e-pasta
          sūtīšana.
        </p>
        <div className="mt-10">
          <PricingTable />
        </div>
      </section>
    </>
  );
}
