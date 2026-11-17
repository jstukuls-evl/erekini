import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { SendInvoiceDialog } from "@/components/invoices/send-invoice-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <AppHeader title="Rēķins" />
      <div className="space-y-6 px-6 py-8">
        <p className="text-sm text-[var(--muted)]">
          Rēķina ID: <code>{id}</code> — detalizētais skats (Phase 1 pieslēgs
          datus).
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={`/invoices/${id}/edit`}>
            <Button>Rediģēt</Button>
          </Link>
          <SendInvoiceDialog />
          <Button variant="secondary" disabled>
            Eksportēt EN 16931 XML
          </Button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          TODO: PDF priekšskatījums, XML ģenerācija un Resend sūtīšana (Phase 2).
        </p>
      </div>
    </>
  );
}
