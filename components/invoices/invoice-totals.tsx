import { formatEur } from "@/lib/utils";

type Props = {
  subtotalExclVat: number;
  vatTotal: number;
  totalInclVat: number;
};

export function InvoiceTotals({
  subtotalExclVat,
  vatTotal,
  totalInclVat,
}: Props) {
  return (
    <dl className="ml-auto w-full max-w-xs space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-[var(--muted)]">Summa bez PVN</dt>
        <dd className="font-medium">{formatEur(subtotalExclVat)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-[var(--muted)]">PVN</dt>
        <dd className="font-medium">{formatEur(vatTotal)}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-[var(--line)] pt-2 text-base">
        <dt className="font-semibold">Kopā ar PVN</dt>
        <dd className="font-semibold">{formatEur(totalInclVat)}</dd>
      </div>
    </dl>
  );
}
