/**
 * Domain enums / helpers for Phase 0.
 * Full Database generics: generate later with `supabase gen types typescript`.
 */

export type MemberRole = "owner" | "admin" | "member" | "viewer";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "paid"
  | "void"
  | "cancelled";

export type VatRateCode =
  | "standard_21"
  | "reduced_12"
  | "reduced_5"
  | "zero_0"
  | "exempt";

export type InvoiceType = "standard" | "credit_note" | "debit_note";

/** Placeholder until generated types are linked — keeps clients untyped-safe. */
export type Database = Record<string, never>;
