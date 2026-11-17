"use client";

import { useEffect, useState } from "react";

import type { OrganizationSummary } from "@/types/domain";

import { ACTIVE_ORG_COOKIE } from "@/lib/org-constants";

const COOKIE = ACTIVE_ORG_COOKIE;

type Props = {
  organizations: OrganizationSummary[];
};

export function OrgSwitcher({ organizations }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE}=`));
    const fromCookie = match?.split("=")[1];
    const initial =
      organizations.find((o) => o.id === fromCookie)?.id ??
      organizations[0]?.id ??
      "";
    setActiveId(initial);
  }, [organizations]);

  function onChange(id: string) {
    setActiveId(id);
    document.cookie = `${COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--line)] px-3 py-2 text-sm text-[var(--muted)]">
        Nav organizācijas
      </div>
    );
  }

  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        Organizācija
      </span>
      <select
        className="h-10 w-full rounded-md border border-[var(--line)] bg-white px-2 text-sm"
        value={activeId}
        onChange={(e) => onChange(e.target.value)}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </label>
  );
}
