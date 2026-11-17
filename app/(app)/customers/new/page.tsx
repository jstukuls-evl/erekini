import { CustomerForm } from "@/components/customers/customer-form";
import { AppHeader } from "@/components/layout/app-header";

export default function NewCustomerPage() {
  return (
    <>
      <AppHeader title="Jauns klients" />
      <div className="px-6 py-8">
        <CustomerForm />
      </div>
    </>
  );
}
