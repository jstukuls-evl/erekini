/**
 * Resend email send stub — Phase 2.
 * Requires RESEND_API_KEY + RESEND_FROM_EMAIL when wired.
 */
export async function sendInvoiceEmail(_input: {
  to: string;
  invoiceId: string;
  pdfPath?: string;
  xmlPath?: string;
}): Promise<{ ok: boolean; message: string }> {
  if (!process.env.RESEND_API_KEY) {
    return {
      ok: false,
      message: "RESEND_API_KEY nav iestatīts — e-pasta sūtīšana vēl nav aktīva.",
    };
  }

  // TODO: call Resend API with PDF + XML attachments.
  return {
    ok: false,
    message: "TODO: Resend sūtīšana vēl nav implementēta (Phase 2).",
  };
}
