import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Clock, X, Info, Gift } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { sendTransactionalEmail } from "@/lib/email/send";
import { z } from "zod";

export const Route = createFileRoute("/app/withdraw")({ component: Withdraw });

const FEE_RATE = 0.02;
const MIN_POINTS = 3000;
const POINTS_PER_USD = 1000; // 1,000 pts ≈ $1 gift card value

const GIFT_CARDS = [
  { id: "amazon", label: "Amazon", emoji: "🛒", note: "Most regions" },
  { id: "visa", label: "Visa Prepaid", emoji: "💳", note: "Use anywhere Visa is accepted" },
  { id: "google_play", label: "Google Play", emoji: "▶️", note: "Apps, games, books" },
  { id: "apple", label: "Apple", emoji: "", note: "App Store & iTunes" },
  { id: "steam", label: "Steam", emoji: "🎮", note: "PC games & in-game items" },
  { id: "starbucks", label: "Starbucks", emoji: "", note: "Selected regions" },
] as const;

const TIERS = [3000, 5000, 10000, 25000];

const formSchema = z.object({
  brand: z.enum(["amazon", "visa", "google_play", "apple", "steam", "starbucks"]),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  amount: z.number().int().min(MIN_POINTS, `Minimum redemption is ${MIN_POINTS.toLocaleString()} points`),
});

type W = {
  id: string;
  points: number;
  status: string;
  created_at: string;
  gift_card_brand: string | null;
  recipient_email: string | null;
};

function Withdraw() {
  const { profile, userId, refresh } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(MIN_POINTS);
  const [brand, setBrand] = useState<(typeof GIFT_CARDS)[number]["id"]>("amazon");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<W[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("withdrawals")
      .select("id, points, status, created_at, gift_card_brand, recipient_email")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    setItems((data ?? []) as W[]);
  };

  useEffect(() => {
    if (!userId) return;
    refresh();
    load();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const balance = profile?.points ?? 0;
  const fee = Math.ceil(amount * FEE_RATE);
  const total = amount + fee;
  const usdValue = useMemo(() => (amount / POINTS_PER_USD).toFixed(2), [amount]);
  const selectedBrand = GIFT_CARDS.find((g) => g.id === brand)!;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = formSchema.safeParse({ brand, email, amount });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0]?.message ?? "Invalid form input");
    }
    if (total > balance) return toast.error("Not enough points (including 2% processing fee)");

    setLoading(true);
    const { data: wd, error } = await supabase
      .rpc("request_withdrawal", {
        p_points: amount,
        p_brand: brand,
        p_email: email.trim(),
      })
      .single();
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Redemption request submitted — we'll email you when it's delivered");

    // Fire-and-forget admin alert; don't block the user on email delivery.
    if (wd?.id) {
      sendTransactionalEmail({
        templateName: "new-redemption-alert",
        idempotencyKey: `redemption-alert-${wd.id}`,
        templateData: {
          userName: profile?.name ?? "Player",
          userEmail: profile?.email ?? null,
          points: wd.points,
          giftCardBrand: wd.gift_card_brand,
          recipientEmail: wd.recipient_email,
          withdrawalId: wd.id,
        },
      }).catch((err) => console.error("Admin alert email failed", err));
    }

    setEmail("");
    setAmount(MIN_POINTS);
    await refresh();
    await load();
  };

  return (
    <div className="bg-background min-h-full">
      <header className="brand-header px-5 pt-5 pb-10 relative">
        <Link
          to="/app/withdraw-history"
          className="absolute left-5 top-5 h-9 w-9 rounded-full border-2 border-brand-foreground/80 flex items-center justify-center text-brand-foreground"
          aria-label="History"
        >
          <Clock className="h-5 w-5" />
        </Link>
        <button
          onClick={() => navigate({ to: "/app" })}
          className="absolute right-5 top-5 text-brand-foreground"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
        <p className="text-center text-brand-foreground/90 text-base font-semibold mt-2">
          Reward Balance
        </p>
        <p className="text-center text-brand-foreground text-5xl font-extrabold tabular-nums mt-1">
          {balance.toLocaleString()} <span className="text-2xl font-bold">pts</span>
        </p>
      </header>

      <form onSubmit={submit} className="px-5 mt-6 space-y-5 pb-6">
        <p className="text-center text-muted-foreground font-semibold flex items-center justify-center gap-2">
          <Gift className="h-4 w-4 text-brand" /> Redeem points for a gift card
        </p>

        {/* Gift card brand selector */}
        <div>
          <label className="block text-sm font-bold mb-2">Choose gift card</label>
          <div className="grid grid-cols-2 gap-2">
            {GIFT_CARDS.map((g) => {
              const active = brand === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setBrand(g.id)}
                  className={`text-left rounded-xl p-3 border-2 transition card-shadow ${
                    active
                      ? "border-brand bg-brand/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden>{g.emoji}</span>
                    <span className="font-bold text-sm">{g.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{g.note}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount tiers */}
        <div>
          <label className="block text-sm font-bold mb-2">Amount</label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {TIERS.map((t) => {
              const active = amount === t;
              const disabled = t > balance;
              return (
                <button
                  key={t}
                  type="button"
                  disabled={disabled}
                  onClick={() => setAmount(t)}
                  className={`rounded-xl py-2 text-xs font-bold border-2 transition disabled:opacity-40 ${
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border bg-card text-foreground"
                  }`}
                >
                  {t.toLocaleString()}
                </button>
              );
            })}
          </div>
          <input
            type="number"
            inputMode="numeric"
            min={MIN_POINTS}
            step={100}
            value={amount || ""}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            placeholder={`${MIN_POINTS}`}
            className="w-full text-center text-3xl font-extrabold tabular-nums bg-card border border-border rounded-xl py-3 outline-none focus:border-brand text-foreground"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-3 text-sm space-y-1">
          <Row label="Estimated value" value={`~$${usdValue} ${selectedBrand.label} card`} />
          <Row label="Processing fee (2%)" value={`${fee.toLocaleString()} pts`} />
          <Row label="Total deducted" value={`${total.toLocaleString()} pts`} bold />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Recipient email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-card border border-border rounded-xl py-3 px-3 outline-none focus:border-brand text-foreground text-sm"
            maxLength={255}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            We email the gift card code here once your request is reviewed.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || total > balance || amount < MIN_POINTS}
          className="block mx-auto pill-btn bg-primary text-primary-foreground px-12 disabled:opacity-60"
        >
          {loading ? "Submitting…" : "REDEEM"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Minimum redemption: {MIN_POINTS.toLocaleString()} points (~$3). Reviews are typically completed within 2 business days.
        </p>

        <Link to="/app/how-rewards" className="flex items-center justify-center gap-2 text-xs text-brand font-semibold">
          <Info className="h-3.5 w-3.5" /> How rewards work
        </Link>
      </form>

      <section className="px-5 pb-10 border-t border-border pt-5">
        <h2 className="font-bold text-foreground mb-3">Recent Redemptions</h2>
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-2">No recent redemptions.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((w) => {
              const card = GIFT_CARDS.find((g) => g.id === w.gift_card_brand);
              return (
                <li
                  key={w.id}
                  className="bg-card border border-border rounded-xl p-3 card-shadow text-sm flex justify-between items-start gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold">
                      {w.points.toLocaleString()} pts · {card?.label ?? w.gift_card_brand ?? "Gift card"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{w.recipient_email}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(w.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={w.status} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-extrabold text-brand" : "font-semibold text-foreground"}>{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-warning text-warning-foreground",
    paid: "bg-success text-success-foreground",
    rejected: "bg-destructive text-destructive-foreground",
  };
  const label = status === "paid" ? "delivered" : status;
  return (
    <span className={`shrink-0 self-start text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {label}
    </span>
  );
}
