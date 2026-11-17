"use client";

import { useMemo, useState } from "react";

import { InvoiceLineTable } from "@/components/invoices/invoice-line-table";
import { InvoiceTotals } from "@/components/invoices/invoice-totals";
import { UrCompanySearch } from "@/components/customers/ur-company-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { vatPercentForCode } from "@/lib/vat";
import type { InvoiceLineDraft } from "@/types/domain";
import type { UrCompanyHit } from "@/lib/ur/types";

type Props = {
  mode?: "new" | "edit";
  initialBuyerName?: string;
};

export function InvoiceEditor({
  mode = "new",
  initialBuyerName = "",
}: Props) {
  const [buyerName, setBuyerName] = useState(initialBuyerName);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Apmaksa 14 dienu laikā");
  const [buyerReference, setBuyerReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<InvoiceLineDraft[]>([
    {
      line_number: 1,
      description: "",
      quantity: 1,
      unit_code: "C62",
      unit_price: 0,
      vat_rate_code: "standard_21",
    },
  ]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce(
      (sum, line) => sum + line.quantity * line.unit_price,
      0,
    );
    const vat = lines.reduce((sum, line) => {
      const excl = line.quantity * line.unit_price;
      return sum + (excl * vatPercentForCode(line.vat_rate_code)) / 100;
    }, 0);
    return {
      subtotalExclVat: round2(subtotal),
      vatTotal: round2(vat),
      totalInclVat: round2(subtotal + vat),
    };
  }, [lines]);

  function applyUrHit(hit: UrCompanyHit) {
    setBuyerName(hit.legalName);
    setRegistrationNumber(hit.registrationNumber);
    setVatNumber(hit.vatNumber ?? "");
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Pircējs (rekvizīti)
          </h2>
          <UrCompanySearch onSelect={applyUrHit} />
          <div>
            <Label htmlFor="buyerName">Nosaukums</Label>
            <Input
              id="buyerName"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="SIA Piemērs"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="regNr">Reģistrācijas nr.</Label>
              <Input
                id="regNr"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vatNr">PVN nr.</Label>
              <Input
                id="vatNr"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="LV…"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Rēķina dati
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="issueDate">Izrakstīšanas datums</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Apmaksas termiņš</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="buyerRef">Pircēja atsauce (BT-10)</Label>
            <Input
              id="buyerRef"
              value={buyerReference}
              onChange={(e) => setBuyerReference(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="terms">Apmaksas nosacījumi</Label>
            <Input
              id="terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="notes">Piezīmes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Rindas
        </h2>
        <InvoiceLineTable lines={lines} onChange={setLines} />
        <InvoiceTotals {...totals} />
      </section>

      <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-6">
        <Button type="button" disabled>
          {mode === "new" ? "Saglabāt melnrakstu" : "Saglabāt"}
        </Button>
        <Button type="button" variant="secondary" disabled>
          Izrakstīt (numurs)
        </Button>
        <p className="w-full text-sm text-[var(--muted)]">
          CRUD un `next_invoice_number` tiek pieslēgti Phase 1 — pašlaik redaktors ir
          funkcionāls skelets ar LV PVN likmēm.
        </p>
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
