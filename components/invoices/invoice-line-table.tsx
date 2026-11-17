"use client";

import { VatRateSelect } from "@/components/invoices/vat-rate-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { vatPercentForCode } from "@/lib/vat";
import { formatEur } from "@/lib/utils";
import type { InvoiceLineDraft } from "@/types/domain";
import type { VatRateCode } from "@/lib/supabase/types";

type Props = {
  lines: InvoiceLineDraft[];
  onChange: (lines: InvoiceLineDraft[]) => void;
};

export function InvoiceLineTable({ lines, onChange }: Props) {
  function updateLine(index: number, patch: Partial<InvoiceLineDraft>) {
    onChange(
      lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    onChange([
      ...lines,
      {
        line_number: lines.length + 1,
        description: "",
        quantity: 1,
        unit_code: "C62",
        unit_price: 0,
        vat_rate_code: "standard_21",
      },
    ]);
  }

  function removeLine(index: number) {
    onChange(
      lines
        .filter((_, i) => i !== index)
        .map((line, i) => ({ ...line, line_number: i + 1 })),
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--line)] text-[var(--muted)]">
            <tr>
              <th className="py-2 pr-2 font-medium">#</th>
              <th className="py-2 pr-2 font-medium">Apraksts</th>
              <th className="py-2 pr-2 font-medium">Daudz.</th>
              <th className="py-2 pr-2 font-medium">Cena</th>
              <th className="py-2 pr-2 font-medium">PVN</th>
              <th className="py-2 pr-2 font-medium">Summa</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const excl = line.quantity * line.unit_price;
              return (
                <tr key={line.line_number} className="align-top border-b border-[var(--line)]/70">
                  <td className="py-2 pr-2 pt-3 text-[var(--muted)]">
                    {line.line_number}
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      value={line.description}
                      onChange={(e) =>
                        updateLine(index, { description: e.target.value })
                      }
                      placeholder="Pakalpojums / prece"
                    />
                  </td>
                  <td className="py-2 pr-2 w-24">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(index, {
                          quantity: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-2 w-28">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) =>
                        updateLine(index, {
                          unit_price: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </td>
                  <td className="py-2 pr-2 w-44">
                    <VatRateSelect
                      value={line.vat_rate_code}
                      onChange={(vat_rate_code: VatRateCode) =>
                        updateLine(index, { vat_rate_code })
                      }
                    />
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {vatPercentForCode(line.vat_rate_code)}%
                    </p>
                  </td>
                  <td className="py-2 pr-2 pt-3 whitespace-nowrap">
                    {formatEur(excl)}
                  </td>
                  <td className="py-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                    >
                      ✕
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={addLine}>
        Pievienot rindu
      </Button>
    </div>
  );
}
