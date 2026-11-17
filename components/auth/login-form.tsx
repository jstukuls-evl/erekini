"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { GoogleOAuthButton } from "@/components/auth/google-oauth-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(
        "Neizdevās pieslēgties. Pārbaudiet Supabase vides mainīgos (.env.local).",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-pasts</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="janos@uznemums.lv"
          />
        </div>
        <div>
          <Label htmlFor="password">Parole</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Pieslēdzos…" : "Pieslēgties"}
        </Button>
      </form>

      <div className="relative text-center text-sm text-[var(--muted)]">
        <span className="bg-[var(--surface)] px-2 relative z-10">vai</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-[var(--line)]" />
      </div>

      <GoogleOAuthButton label="Turpināt ar Google" />

      <p className="text-center text-sm text-[var(--muted)]">
        Nav konta?{" "}
        <Link href="/signup" className="text-[var(--brand)] underline-offset-2 hover:underline">
          Reģistrēties
        </Link>
      </p>
    </div>
  );
}
