import type { InvoiceStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const LABELS: Record<InvoiceStatus, string> = {
  draft: "Melnraksts",
  issued: "Izrakstīts",
  sent: "Nosūtīts",
  paid: "Apmaksāts",
  void: "Anulēts",
  cancelled: "Atcelts",
};

const STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  issued: "bg-sky-100 text-sky-800",
  sent: "bg-teal-100 text-teal-800",
  paid: "bg-emerald-100 text-emerald-800",
  void: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-800",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded px-2 py-0.5 text-xs font-medium",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
