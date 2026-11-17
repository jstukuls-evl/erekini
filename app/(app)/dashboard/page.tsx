import Link from "next/link";

import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let email: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  } catch {
    // ignore
  }

  return (
    <>
      <AppHeader title="Pārskats" email={email} />
      <div className="space-y-8 px-6 py-8">
        <section className="max-w-2xl space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Sveicināti erekini
          </h2>
          <p className="text-[var(--ink-soft)]">
            Šis ir Phase 0 pamats: organizācijas konteksts, rēķinu saraksts un
            redaktora skelets ar LV rekvizītiem. Pievienojiet Supabase projektu,
            lai aktivizētu Auth un RLS.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/invoices/new">
              <Button>Jauns rēķins</Button>
            </Link>
            <Link href="/customers">
              <Button variant="secondary">Klienti</Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
