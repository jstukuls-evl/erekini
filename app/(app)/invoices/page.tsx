import Link from "next/link";
import { cookies } from "next/headers";

import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { listInvoices } from "@/lib/actions/invoices";
import { listMemberships } from "@/lib/actions/org";
import { ACTIVE_ORG_COOKIE } from "@/lib/org-constants";
import { formatEur } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/supabase/types";

export default async function InvoicesPage() {
  const memberships = await safeMemberships();
  const cookieStore = await cookies();
  const orgId =
    cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? memberships[0]?.id ?? null;

  const result = orgId
    ? await listInvoices(orgId)
    : { ok: true as const, invoices: [] };

  return (
    <>
      <AppHeader title="Rēķini" />
      <div className="space-y-6 px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            Rēķinu saraksts no `invoices` tabulas (RLS filtrē pēc organizācijas).
          </p>
          <Link href="/invoices/new">
            <Button>Jauns rēķins</Button>
          </Link>
        </div>

        {!orgId ? (
          <p className="text-sm text-[var(--muted)]">
            Izveidojiet organizāciju, lai redzētu rēķinus.
          </p>
        ) : null}

        {!result.ok ? (
          <p className="text-sm text-red-700">{result.error}</p>
        ) : null}

        <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Numurs</th>
                <th className="px-4 py-3 font-medium">Pircējs</th>
                <th className="px-4 py-3 font-medium">Statuss</th>
                <th className="px-4 py-3 font-medium">Datums</th>
                <th className="px-4 py-3 font-medium text-right">Summa</th>
              </tr>
            </thead>
            <tbody>
              {result.invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-[var(--muted)]"
                  >
                    Vēl nav rēķinu. Izveidojiet pirmo melnrakstu.
                  </td>
                </tr>
              ) : (
                result.invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[var(--line)]/70 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-[var(--brand)] hover:underline"
                      >
                        {inv.invoice_number ?? "Melnraksts"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {inv.buyer_name_snapshot ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge
                        status={inv.status as InvoiceStatus}
                      />
                    </td>
                    <td className="px-4 py-3">{inv.issue_date ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {formatEur(Number(inv.total_incl_vat))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

async function safeMemberships() {
  try {
    return await listMemberships();
  } catch {
    return [];
  }
}
