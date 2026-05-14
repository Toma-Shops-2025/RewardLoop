import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/withdraw-history")({ component: WithdrawHistory });

type W = {
  id: string;
  points: number;
  status: string;
  created_at: string;
  gift_card_brand: string | null;
  recipient_email: string | null;
};

const BRAND_LABELS: Record<string, string> = {
  amazon: "Amazon",
  visa: "Visa Prepaid",
  google_play: "Google Play",
  apple: "Apple",
  steam: "Steam",
  starbucks: "Starbucks",
};

function WithdrawHistory() {
  const { userId } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState<W[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("withdrawals")
      .select("id, points, status, created_at, gift_card_brand, recipient_email")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []) as W[]);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="bg-background min-h-full">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app/withdraw" })} aria-label="Back" className="text-brand-foreground">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-brand-foreground">Redemption History</h1>
      </header>

      <section className="px-5 mt-8">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">No redemptions yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((w) => (
              <li key={w.id} className="bg-card border border-border rounded-xl p-4 card-shadow">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">
                      {w.points.toLocaleString()} pts ·{" "}
                      {BRAND_LABELS[w.gift_card_brand ?? ""] ?? w.gift_card_brand ?? "Gift card"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(w.created_at).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 break-all">{w.recipient_email}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      w.status === "pending"
                        ? "bg-warning text-warning-foreground"
                        : w.status === "paid"
                        ? "bg-success text-success-foreground"
                        : w.status === "rejected"
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {w.status === "paid" ? "delivered" : w.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
