"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function onClick() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Env may be missing in local scaffold — still leave the shell.
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick}>
      Iziet
    </Button>
  );
}
