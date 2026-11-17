import Link from "next/link";
import { cookies } from "next/headers";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { listCustomers } from "@/lib/actions/customers";
import { listMemberships } from "@/lib/actions/org";
import { ACTIVE_ORG_COOKIE } from "@/lib/org-constants";

export default async function CustomersPage() {
  let memberships: Awaited<ReturnType<typeof listMemberships>> = [];
  try {
    memberships = await listMemberships();
  } catch {
    memberships = [];
  }

  const cookieStore = await cookies();
  const orgId =
    cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? memberships[0]?.id ?? null;
  const result = orgId
    ? await listCustomers(orgId)
    : { ok: true as const, customers: [] };

  return (
    <>
      <AppHeader title="Klienti" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            Kontrahenti / pircēji. UR meklēšana aizpilda rekvizītus.
          </p>
          <Link href="/customers/new">
            <Button>Jauns klients</Button>
          </Link>
        </div>

        <ul className="divide-y divide-[var(--line)] rounded-md border border-[var(--line)] bg-white">
          {result.customers.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              Nav klientu. Pievienojiet manuāli vai caur UR meklēšanu.
            </li>
          ) : (
            result.customers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-[var(--brand-soft)]"
                >
                  <span>
                    <span className="font-medium text-[var(--ink)]">
                      {c.legal_name}
                    </span>
                    {c.registration_number ? (
                      <span className="ml-2 text-[var(--muted)]">
                        {c.registration_number}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[var(--muted)]">{c.city ?? ""}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
