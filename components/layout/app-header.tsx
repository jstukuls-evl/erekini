import { SignOutButton } from "@/components/auth/sign-out-button";

type Props = {
  title: string;
  email?: string | null;
};

export function AppHeader({ title, email }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          {title}
        </h1>
        {email ? (
          <p className="text-sm text-[var(--muted)]">{email}</p>
        ) : null}
      </div>
      <SignOutButton />
    </header>
  );
}
