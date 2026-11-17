import Link from "next/link";

import { Button } from "@/components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Bezmaksas",
    price: "0 €",
    blurb: "Pašnodarbinātajiem — līdz 5 rēķiniem mēnesī.",
    features: ["Rēķinu melnraksti", "LV PVN likmes", "1 organizācija"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "19 €",
    blurb: "Augošiem MVU — XML eksports un e-pasta sūtīšana.",
    features: ["Līdz 100 rēķiniem / mēn.", "EN 16931 XML", "E-pasta sūtīšana"],
    highlighted: true,
  },
  {
    id: "business",
    name: "Bizness",
    price: "49 €",
    blurb: "Komandām ar lielāku apjomu un atbalstu.",
    features: ["Neierobežoti rēķini", "Komandas lomas", "Prioritārs atbalsts"],
  },
];

export function PricingTable() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {PLANS.map((plan, index) => (
        <article
          key={plan.id}
          className="animate-[fade-up_0.7s_ease_both] border-t border-[var(--line)] pt-6"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <h3 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            {plan.name}
          </h3>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
            {plan.price}
            <span className="text-base font-normal text-[var(--muted)]">
              {" "}
              / mēn.
            </span>
          </p>
          <p className="mt-3 text-sm text-[var(--ink-soft)]">{plan.blurb}</p>
          <ul className="mt-6 space-y-2 text-sm text-[var(--ink)]">
            {plan.features.map((f) => (
              <li key={f}>— {f}</li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href="/signup">
              <Button
                variant={plan.highlighted ? "primary" : "secondary"}
                className="w-full sm:w-auto"
              >
                Sākt ar {plan.name}
              </Button>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
