import type {
  InvoiceStatus,
  InvoiceType,
  MemberRole,
  VatRateCode,
} from "@/lib/supabase/types";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  role: MemberRole;
};

export type InvoiceListItem = {
  id: string;
  invoice_number: string | null;
  status: InvoiceStatus;
  invoice_type: InvoiceType;
  buyer_name_snapshot: string | null;
  issue_date: string | null;
  due_date: string | null;
  total_incl_vat: number;
  currency_code: string;
};

export type InvoiceLineDraft = {
  id?: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_code: string;
  unit_price: number;
  vat_rate_code: VatRateCode;
  vat_exemption_reason?: string;
};

export type CustomerDraft = {
  legal_name: string;
  registration_number?: string;
  vat_number?: string;
  legal_address_line1?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
  email?: string;
  ur_source_id?: string;
};
