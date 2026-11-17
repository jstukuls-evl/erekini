"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOrganization } from "@/lib/actions/org";

export function CreateOrgDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createOrganization({ name, slug });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOpen(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Jauna organizācija
      </Button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-md border border-[var(--line)] bg-white p-4"
    >
      <div>
        <Label htmlFor="org-name">Nosaukums</Label>
        <Input
          id="org-name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slug) {
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, ""),
              );
            }
          }}
        />
      </div>
      <div>
        <Label htmlFor="org-slug">Slug</Label>
        <Input
          id="org-slug"
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          Izveidot
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Atcelt
        </Button>
      </div>
    </form>
  );
}
