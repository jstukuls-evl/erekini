import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <>
      <AppHeader title="Iestatījumi" />
      <div className="mx-auto max-w-2xl space-y-10 px-6 py-8">
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Uzņēmuma rekvizīti
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Pārdevēja dati (`company_profiles`) — EN 16931 AccountingSupplierParty.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="legalName">Juridiskais nosaukums</Label>
              <Input id="legalName" placeholder="SIA …" disabled />
            </div>
            <div>
              <Label htmlFor="reg">Reģistrācijas nr.</Label>
              <Input id="reg" disabled />
            </div>
            <div>
              <Label htmlFor="vat">PVN nr.</Label>
              <Input id="vat" placeholder="LV…" disabled />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addr">Juridiskā adrese</Label>
              <Input id="addr" disabled />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Bankas konti
          </h2>
          <p className="text-sm text-[var(--muted)]">
            IBAN / BIC (`bank_accounts`) — PaymentMeans.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" disabled />
            </div>
            <div>
              <Label htmlFor="bic">BIC</Label>
              <Input id="bic" disabled />
            </div>
          </div>
        </section>

        <p className="text-sm text-[var(--muted)]">
          Saglabāšana tiks pieslēgta Phase 1.{" "}
          <Link href="/settings/members" className="text-[var(--brand)] underline">
            Dalībnieki
          </Link>
          {" · "}
          <Link href="/settings/billing" className="text-[var(--brand)] underline">
            Norēķini
          </Link>
        </p>
      </div>
    </>
  );
}
