import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="px-6 py-5 md:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
        >
          erekini
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-6 pb-16 pt-8 md:pt-16">
        <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface-elevated)]/90 p-6 shadow-sm md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
