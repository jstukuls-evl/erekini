import { NextResponse } from "next/server";

/**
 * Resend delivery webhook stub — Phase 2.
 * TODO: verify signature, update invoices.last_sent_* with service role.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      message: "TODO: Resend webhook handler (Phase 2).",
    },
    { status: 501 },
  );
}
