"use client";

import { useEffect, useId, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UrCompanyHit, UrSearchResponse } from "@/lib/ur/types";

type Props = {
  onSelect: (hit: UrCompanyHit) => void;
};

export function UrCompanySearch({ onSelect }: Props) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UrCompanyHit[]>([]);
  const [note, setNote] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setNote(undefined);
      return;
    }

    const handle = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/ur/search?q=${encodeURIComponent(query.trim())}`,
          );
          const data = (await res.json()) as UrSearchResponse;
          setResults(data.results);
          setNote(data.note);
          setOpen(true);
        } catch {
          setResults([]);
          setNote("UR meklēšana neizdevās.");
        }
      });
    }, 280);

    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor={`${listId}-q`}>Meklēt UR datos</Label>
      <Input
        id={`${listId}-q`}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${listId}-list`}
        aria-autocomplete="list"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Nosaukums vai reģ. nr."
        autoComplete="off"
      />
      {pending ? (
        <p className="text-xs text-[var(--muted)]">Meklēju…</p>
      ) : null}
      {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
      {open && results.length > 0 ? (
        <ul
          id={`${listId}-list`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[var(--line)] bg-white shadow-md"
        >
          {results.map((hit) => (
            <li key={hit.sourceId} role="option">
              <button
                type="button"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-[var(--brand-soft)]"
                onClick={() => {
                  onSelect(hit);
                  setQuery(hit.legalName);
                  setOpen(false);
                }}
              >
                <span className="font-medium text-[var(--ink)]">
                  {hit.legalName}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {hit.registrationNumber}
                  {hit.city ? ` · ${hit.city}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
