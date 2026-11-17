"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

/** Phase 0 stubs — wire to real CRUD in Phase 1. */
export async function listInvoices(organizationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, status, invoice_type, buyer_name_snapshot, issue_date, due_date, total_incl_vat, currency_code",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false as const, error: error.message, invoices: [] };
  }

  return { ok: true as const, invoices: data ?? [] };
}

export async function createDraftInvoice(organizationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      organization_id: organizationId,
      status: "draft",
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/invoices");
  return { ok: true as const, id: data.id };
}
