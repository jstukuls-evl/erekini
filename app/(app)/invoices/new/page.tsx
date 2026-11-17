import { AppHeader } from "@/components/layout/app-header";
import { InvoiceEditor } from "@/components/invoices/invoice-editor";

export default function NewInvoicePage() {
  return (
    <>
      <AppHeader title="Jauns rēķins" />
      <div className="px-6 py-8">
        <InvoiceEditor mode="new" />
      </div>
    </>
  );
}
