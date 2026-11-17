import { AppHeader } from "@/components/layout/app-header";

export default function BillingPage() {
  return (
    <>
      <AppHeader title="Norēķini" />
      <div className="mx-auto max-w-xl space-y-4 px-6 py-8">
        <p className="text-[var(--ink-soft)]">
          Plāni (`plans` / `subscriptions`) ir seedoti migrācijā. Stripe
          pieslēgums — vēlākā fāzē.
        </p>
        <ul className="space-y-2 text-sm text-[var(--ink)]">
          <li>— Bezmaksas: 0 € / mēn.</li>
          <li>— Pro: 19 € / mēn.</li>
          <li>— Bizness: 49 € / mēn.</li>
        </ul>
      </div>
    </>
  );
}
