"use client";

import { VAT_RATE_OPTIONS } from "@/lib/vat";
import type { VatRateCode } from "@/lib/supabase/types";

type Props = {
  value: VatRateCode;
  onChange: (value: VatRateCode) => void;
  id?: string;
};

export function VatRateSelect({ value, onChange, id }: Props) {
  return (
    <select
      id={id}
      className="h-10 w-full rounded-md border border-[var(--line)] bg-white px-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as VatRateCode)}
    >
      {VAT_RATE_OPTIONS.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
