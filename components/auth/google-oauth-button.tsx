"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  label?: string;
};

export function GoogleOAuthButton({ label = "Turpināt ar Google" }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch {
      setError(
        "Google OAuth nav pieejams. Iestatiet Google provider Supabase Dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onClick}
        disabled={loading}
      >
        {loading ? "Novirzu…" : label}
      </Button>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
