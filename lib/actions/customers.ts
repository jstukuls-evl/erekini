"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { CustomerDraft } from "@/types/domain";

export async function listCustomers(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, legal_name, registration_number, vat_number, city, email, created_at",
    )
    .eq("organization_id", organizationId)
    .order("legal_name");

  if (error) {
    return { ok: false as const, error: error.message, customers: [] };
  }

  return { ok: true as const, customers: data ?? [] };
}

export async function createCustomer(
  organizationId: string,
  draft: CustomerDraft,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({
      organization_id: organizationId,
      legal_name: draft.legal_name,
      registration_number: draft.registration_number ?? null,
      vat_number: draft.vat_number ?? null,
      legal_address_line1: draft.legal_address_line1 ?? null,
      city: draft.city ?? null,
      postal_code: draft.postal_code ?? null,
      country_code: draft.country_code ?? "LV",
      email: draft.email ?? null,
      ur_source_id: draft.ur_source_id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/customers");
  return { ok: true as const, id: data.id };
}
