import { InstitutionCombobox } from "@/components/institutions/institution-combobox";
import { AppHeader } from "@/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";

export default async function InstitutionsPage() {
  let institutions: Array<{
    id: string;
    name: string;
    registration_number: string | null;
    city: string | null;
    institution_type: string | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("public_institution_einvoice_addresses")
      .select(
        "id, name, registration_number, city, institution_type",
      )
      .eq("is_active", true)
      .order("name");
    institutions = data ?? [];
  } catch {
    institutions = [];
  }

  return (
    <>
      <AppHeader title="Iestādes (B2G)" />
      <div className="mx-auto max-w-xl space-y-4 px-6 py-8">
        <p className="text-sm text-[var(--ink-soft)]">
          Globālais e-rēķinu galapunktu direktorijs (seed no migrācijas).
          Endpoint vērtības ir placeholder — aizvietojiet ar oficiālajiem
          datiem pirms produkcijas.
        </p>
        <InstitutionCombobox institutions={institutions} />
      </div>
    </>
  );
}
