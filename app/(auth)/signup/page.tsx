import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Reģistrēties",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Izveidot kontu
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Sāciet ar bezmaksas plānu. Organizāciju varēsiet pievienot pēc
          pieslēgšanās.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
