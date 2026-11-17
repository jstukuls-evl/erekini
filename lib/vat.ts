import type { VatRateCode } from "@/lib/supabase/types";

export const VAT_RATE_OPTIONS: Array<{
  code: VatRateCode;
  label: string;
  percent: number;
}> = [
  { code: "standard_21", label: "21% — standarta", percent: 21 },
  { code: "reduced_12", label: "12% — samazinātā", percent: 12 },
  { code: "reduced_5", label: "5% — samazinātā", percent: 5 },
  { code: "zero_0", label: "0%", percent: 0 },
  { code: "exempt", label: "Neapliekams", percent: 0 },
];

export function vatPercentForCode(code: VatRateCode): number {
  return VAT_RATE_OPTIONS.find((o) => o.code === code)?.percent ?? 21;
}
