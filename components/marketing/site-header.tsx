import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between gap-4 px-6 py-5 md:px-10">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]"
      >
        erekini
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/pricing"
          className="hidden text-sm text-[var(--ink-soft)] hover:text-[var(--ink)] sm:inline"
        >
          Cenas
        </Link>
        <Link href="/login">
          <Button variant="ghost" size="sm">
            Pieslēgties
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">Sākt</Button>
        </Link>
      </nav>
    </header>
  );
}
