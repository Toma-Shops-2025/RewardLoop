import { createFileRoute } from "@tanstack/react-router";
import { Copy, Share2, Users, ShieldAlert, Trophy, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/referrals")({ component: Referrals });

const MILESTONES = [
  { friends: 1, reward: 50, label: "First Invite" },
  { friends: 5, reward: 250, label: "Connector" },
  { friends: 10, reward: 600, label: "Influencer" },
  { friends: 25, reward: 2000, label: "Ambassador" },
];

function Referrals() {
  const { profile, userId } = useApp();
  const [referredCount, setReferredCount] = useState(0);
  const [commission, setCommission] = useState(0);

  useEffect(() => {
    if (!profile) return;
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", userId)
      .then(({ count }) => setReferredCount(count ?? 0));
    supabase.from("transactions").select("points").eq("user_id", userId).eq("type", "referral_commission")
      .then(({ data }) => setCommission((data ?? []).reduce((s, t: any) => s + t.points, 0)));
  }, [profile, userId]);

  const code = profile?.referral_code ?? "";
  const link = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${code}` : "";
  const shareMessage = `Join me on RewardLoop — earn reward points for everyday engagement. Use my invite code ${code} for a 50-point welcome bonus: ${link}`;

  const copy = async () => { await navigator.clipboard.writeText(code); toast.success("Code copied!"); };
  const copyLink = async () => { await navigator.clipboard.writeText(link); toast.success("Link copied!"); };

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "RewardLoop", text: shareMessage, url: link }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(shareMessage);
      toast.success("Invite copied!");
    }
  };

  const openSocial = (platform: "whatsapp" | "telegram" | "twitter") => {
    const enc = encodeURIComponent(shareMessage);
    const urls = {
      whatsapp: `https://wa.me/?text=${enc}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${enc}`,
      twitter: `https://twitter.com/intent/tweet?text=${enc}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
  };

  const nextMilestone = MILESTONES.find((m) => referredCount < m.friends) ?? MILESTONES[MILESTONES.length - 1];
  const milestonePct = Math.min(100, (referredCount / nextMilestone.friends) * 100);

  return (
    <div className="bg-background min-h-full pb-10">
      <header className="brand-header px-5 pt-5 pb-7 text-center">
        <Users className="mx-auto h-12 w-12 text-brand-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-bold text-brand-foreground mt-2">Invite &amp; Earn</h1>
        <p className="text-brand-foreground/90 text-sm mt-1 px-4">
          Share your code. Friends get a 50-point welcome bonus and you earn a referral bonus from their engagement.
        </p>
      </header>

      <section className="px-4 mt-6 space-y-4">
        <div className="bg-card border border-border rounded-2xl p-5 card-shadow">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Your Referral Code</p>
          <p className="text-4xl font-extrabold tracking-widest text-brand mt-2 tabular-nums">{code}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button onClick={copy} className="pill-btn bg-secondary text-secondary-foreground py-3 text-xs flex items-center justify-center gap-1.5">
              <Copy className="h-4 w-4" /> Code
            </button>
            <button onClick={copyLink} className="pill-btn bg-secondary text-secondary-foreground py-3 text-xs flex items-center justify-center gap-1.5">
              <Copy className="h-4 w-4" /> Link
            </button>
            <button onClick={share} className="pill-btn bg-primary text-primary-foreground py-3 text-xs flex items-center justify-center gap-1.5">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          {/* Social quick share */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SocialBtn onClick={() => openSocial("whatsapp")} icon={MessageCircle} label="WhatsApp" />
            <SocialBtn onClick={() => openSocial("telegram")} icon={Send} label="Telegram" />
            <SocialBtn onClick={() => openSocial("twitter")} icon={Share2} label="X / Twitter" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <p className="text-xs text-muted-foreground">Friends Invited</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{referredCount}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
            <p className="text-xs text-muted-foreground">Referral Bonus</p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums">{commission}</p>
          </div>
        </div>

        {/* Milestone progress */}
        <div className="bg-card border border-border rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="flex items-center gap-2 text-sm font-bold">
              <Trophy className="h-4 w-4 text-brand" /> {nextMilestone.label}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">{referredCount}/{nextMilestone.friends} · +{nextMilestone.reward} pts</p>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full brand-bg transition-all duration-700" style={{ width: `${milestonePct}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3 card-shadow flex gap-3">
          <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Duplicate accounts, fake referrals, and bot signups are strictly prohibited. Suspicious activity is monitored
            and may result in forfeited bonuses and account restriction.
          </p>
        </div>
      </section>
    </div>
  );
}

function SocialBtn({ onClick, icon: Icon, label }: { onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick} className="bg-card border border-border rounded-xl p-2.5 flex flex-col items-center gap-1 active:scale-95 transition">
      <Icon className="h-4 w-4 text-brand" />
      <span className="text-[10px] font-bold text-foreground">{label}</span>
    </button>
  );
}
