import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Check, X, ShieldAlert, Copy } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/app/admin/redemptions")({
  component: AdminRedemptions,
});

type Row = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  points: number;
  gift_card_brand: string | null;
  recipient_email: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

const BRAND_LABELS: Record<string, string> = {
  amazon: "Amazon",
  visa: "Visa Prepaid",
  google_play: "Google Play",
  apple: "Apple",
  steam: "Steam",
  starbucks: "Starbucks",
};

function AdminRedemptions() {
  const { userId } = useApp();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Check admin role
  useEffect(() => {
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_withdrawals", { p_status: filter });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const approve = async (r: Row) => {
    const code = window.prompt(
      `Paste the ${BRAND_LABELS[r.gift_card_brand ?? ""] ?? "gift card"} code for ${r.recipient_email}:`
    );
    if (!code || code.trim().length < 3) return;
    setBusyId(r.id);
    const { error } = await supabase.rpc("approve_withdrawal", { p_id: r.id, p_code: code.trim() });
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Marked as delivered");
    load();
  };

  const reject = async (r: Row) => {
    const reason = window.prompt(
      `Reject this ${r.points.toLocaleString()}-pt redemption? Points will be refunded.\n\nReason:`
    );
    if (!reason || reason.trim().length < 3) return;
    setBusyId(r.id);
    const { error } = await supabase.rpc("reject_withdrawal", { p_id: r.id, p_reason: reason.trim() });
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Rejected and points refunded");
    load();
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <h2 className="text-lg font-bold">Admin access required</h2>
        <p className="text-sm text-muted-foreground">This page is for administrators only.</p>
        <button
          className="mt-2 px-4 py-2 rounded-lg bg-brand text-brand-foreground font-semibold"
          onClick={() => navigate({ to: "/app" })}
        >
          Back to app
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-full">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app/profile" })} aria-label="Back" className="text-brand-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-brand-foreground">Redemption Review</h1>
      </header>

      <div className="px-5 mt-5 flex gap-2">
        {(["pending", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${
              filter === f
                ? "bg-brand text-brand-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground"
        >
          Refresh
        </button>
      </div>

      <section className="px-5 mt-4 pb-8">
        {loading ? (
          <p className="text-center text-muted-foreground mt-8">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">No {filter === "pending" ? "pending" : ""} redemptions.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="bg-card border border-border rounded-xl p-4 card-shadow">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">
                      {r.points.toLocaleString()} pts ·{" "}
                      {BRAND_LABELS[r.gift_card_brand ?? ""] ?? r.gift_card_brand ?? "Gift card"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.user_name} {r.user_email ? `· ${r.user_email}` : ""}
                    </p>
                    <p className="text-xs mt-1 break-all flex items-center gap-1.5">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{r.recipient_email}</span>
                      {r.recipient_email && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(r.recipient_email!);
                            toast.success("Copied");
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Copy email"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                    {r.admin_notes && (
                      <p className="text-[10px] text-muted-foreground mt-1 break-all italic">
                        {r.admin_notes}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      r.status === "pending"
                        ? "bg-warning text-warning-foreground"
                        : r.status === "paid"
                        ? "bg-success text-success-foreground"
                        : "bg-destructive text-destructive-foreground"
                    }`}
                  >
                    {r.status === "paid" ? "delivered" : r.status}
                  </span>
                </div>

                {r.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => approve(r)}
                      disabled={busyId === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-success text-success-foreground font-semibold text-sm disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> Mark delivered
                    </button>
                    <button
                      onClick={() => reject(r)}
                      disabled={busyId === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> Reject & refund
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
