import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Pieslēgties",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Pieslēgties
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          E-pasts un parole, vai Google caur Supabase Auth.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
