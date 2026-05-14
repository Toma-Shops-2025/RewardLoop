import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Mail, Star, Share2, Shield, FileText, HelpCircle, X } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/rewardloop-logo.png";

export const Route = createFileRoute("/app/about")({ component: AboutPage });

const APP_VERSION = "2.0.0";
const SHARE_TEXT = "Join me on RewardLoop — complete missions, play trivia, and earn reward points. ";
const PACKAGE_ID = "app.rewardloop";
const CONTACT_EMAIL = "support@rewardloop.app";

function AboutPage() {
  const navigate = useNavigate();
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const onShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "RewardLoop", text: SHARE_TEXT, url: shareUrl }); }
      catch {}
    } else {
      await navigator.clipboard.writeText(`${SHARE_TEXT}${shareUrl}`);
      toast.success("Link copied!");
    }
  };

  const onRate = () => {
    // Opens Play Store on Android, falls back to web listing elsewhere
    const playUrl = `https://play.google.com/store/apps/details?id=${PACKAGE_ID}`;
    if (typeof window !== "undefined" && /android/i.test(navigator.userAgent)) {
      window.location.href = `market://details?id=${PACKAGE_ID}`;
      setTimeout(() => window.open(playUrl, "_blank"), 600);
    } else {
      window.open(playUrl, "_blank");
    }
  };

  const items = [
    { icon: Mail, label: "Contact Support", onClick: () => window.location.assign(`mailto:${CONTACT_EMAIL}`) },
    { icon: Star, label: "Rate us on Google Play", onClick: onRate },
    { icon: Share2, label: "Share with friends", onClick: onShare },
    { icon: HelpCircle, label: "How rewards work", onClick: () => navigate({ to: "/app/how-rewards" }) },
    { icon: Shield, label: "Privacy Policy", onClick: () => navigate({ to: "/legal/privacy" }) },
    { icon: FileText, label: "Terms of Service", onClick: () => navigate({ to: "/legal/terms" }) },
  ];

  return (
    <div className="bg-dark min-h-screen text-foreground-on-dark relative">
      <button
        onClick={() => navigate({ to: "/app" })}
        className="absolute right-5 top-5 text-foreground-on-dark/80 z-10"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="dark-world-bg pt-12 pb-8 px-5 flex flex-col items-center">
        <img src={logo} alt="RewardLoop" className="h-24 w-24 rounded-2xl border-2 border-brand" />
        <h1 className="mt-3 text-2xl font-extrabold text-foreground-on-dark">RewardLoop</h1>
        <p className="text-sm text-foreground-on-dark/60">{APP_VERSION}</p>
      </div>

      <ul className="px-5 pb-12 space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label}>
              <button
                onClick={it.onClick}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-brand/30 bg-dark-card text-left hover:bg-brand/10 transition-colors"
              >
                <Icon className="h-5 w-5 text-foreground-on-dark/80 shrink-0" />
                <span className="font-semibold text-foreground-on-dark">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
