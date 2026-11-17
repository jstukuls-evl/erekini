import Link from "next/link";

import { CreateOrgDialog } from "@/components/org/create-org-dialog";
import { OrgSwitcher } from "@/components/org/org-switcher";
import type { OrganizationSummary } from "@/types/domain";

const NAV = [
  { href: "/dashboard", label: "Pārskats" },
  { href: "/invoices", label: "Rēķini" },
  { href: "/customers", label: "Klienti" },
  { href: "/institutions", label: "Iestādes (B2G)" },
  { href: "/settings", label: "Iestatījumi" },
  { href: "/settings/billing", label: "Norēķini" },
];

type Props = {
  organizations: OrganizationSummary[];
};

export function AppSidebar({ organizations }: Props) {
  return (
    <aside className="flex w-full flex-col gap-6 border-b border-[var(--line)] bg-[var(--surface-elevated)]/80 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <Link
        href="/dashboard"
        className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
      >
        erekini
      </Link>
      <OrgSwitcher organizations={organizations} />
      <CreateOrgDialog />
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm text-[var(--ink-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--ink)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
