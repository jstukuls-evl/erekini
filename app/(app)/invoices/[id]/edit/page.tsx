import { AppHeader } from "@/components/layout/app-header";
import { InvoiceEditor } from "@/components/invoices/invoice-editor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <AppHeader title={`Rediģēt rēķinu`} />
      <div className="space-y-4 px-6 py-8">
        <p className="text-sm text-[var(--muted)]">
          ID: <code>{id}</code>
        </p>
        <InvoiceEditor mode="edit" />
      </div>
    </>
  );
}
