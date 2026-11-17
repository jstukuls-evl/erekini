"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function createOrganization(input: {
  name: string;
  slug: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization_with_owner", {
    p_name: input.name,
    p_slug: input.slug,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true as const, organization: data };
}

export async function listMemberships() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: memberships, error } = await supabase
    .from("organization_members")
    .select("role, organization_id")
    .eq("user_id", user.id);

  if (error || !memberships?.length) {
    return [];
  }

  const orgIds = memberships.map((m) => m.organization_id);
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .in("id", orgIds);

  const byId = new Map((orgs ?? []).map((o) => [o.id, o]));

  return memberships.flatMap((row) => {
    const org = byId.get(row.organization_id);
    if (!org) return [];
    return [
      {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: row.role,
      },
    ];
  });
}
