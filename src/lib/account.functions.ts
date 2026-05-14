import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Permanently delete the signed-in user's account.
 *
 * Steps:
 *   1. Run public.delete_my_account() as the user (RLS) to scrub owned rows
 *      and anonymize their profile.
 *   2. Use the admin client to remove the auth.users record so the email
 *      is freed and no further sign-in is possible.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { error: rpcErr } = await supabase.rpc("delete_my_account");
    if (rpcErr) throw new Error(rpcErr.message);

    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) throw new Error(authErr.message);

    return { ok: true };
  });
