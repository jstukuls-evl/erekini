import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { listMemberships } from "@/lib/actions/org";
import { ACTIVE_ORG_COOKIE } from "@/lib/org-constants";
import { createClient } from "@/lib/supabase/server";
import type { OrganizationSummary } from "@/types/domain";

// Auth shell reads cookies / session — allow blocking (Cache Components).
export const instant = false;

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let organizations: OrganizationSummary[] = [];
  let email: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
    organizations = await listMemberships();
  } catch {
    // Missing env during local scaffold — shell still renders.
  }

  const cookieStore = await cookies();
  const activeOrg =
    cookieStore.get(ACTIVE_ORG_COOKIE)?.value ?? organizations[0]?.id ?? null;

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <AppSidebar organizations={organizations} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sr-only" data-active-org={activeOrg ?? ""} />
        {children}
        {!email ? (
          <p className="px-6 pb-6 text-xs text-[var(--muted)]">
            Auth sesija nav pieejama, līdz `.env.local` satur Supabase atslēgas.
          </p>
        ) : null}
      </div>
    </div>
  );
}
