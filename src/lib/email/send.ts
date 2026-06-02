import { supabase } from "@/integrations/supabase/client";

interface SendTransactionalEmailParams {
  templateName: string;
  recipientEmail?: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}

/**
 * Send a transactional email via the internal Lovable email route.
 * The route validates the caller's Supabase JWT, so the user must be signed in.
 * Errors are surfaced as thrown exceptions — callers should wrap in try/catch
 * if they don't want the email failure to break the calling flow.
 */
export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch("/lovable/email/transactional/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify({
      templateName: params.templateName,
      recipientEmail: params.recipientEmail,
      idempotencyKey: params.idempotencyKey,
      templateData: params.templateData,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${body}`);
  }
  return res.json();
}
