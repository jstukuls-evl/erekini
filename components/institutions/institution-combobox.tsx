"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type InstitutionOption = {
  id: string;
  name: string;
  registration_number: string | null;
  city: string | null;
  institution_type: string | null;
};

type Props = {
  institutions: InstitutionOption[];
  onSelect?: (item: InstitutionOption) => void;
};

export function InstitutionCombobox({ institutions, onSelect }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return institutions.slice(0, 8);
    return institutions
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.registration_number ?? "").includes(q),
      )
      .slice(0, 8);
  }, [institutions, query]);

  return (
    <div className="space-y-2">
      <Label htmlFor="inst-search">Meklēt iestādi</Label>
      <Input
        id="inst-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pašvaldība, aģentūra…"
      />
      <ul className="divide-y divide-[var(--line)] rounded-md border border-[var(--line)] bg-white">
        {filtered.length === 0 ? (
          <li className="px-3 py-3 text-sm text-[var(--muted)]">
            Nav rezultātu (pēc migrācijas seed datiem).
          </li>
        ) : (
          filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-[var(--brand-soft)]"
                onClick={() => onSelect?.(item)}
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-[var(--muted)]">
                  {[item.institution_type, item.registration_number, item.city]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
