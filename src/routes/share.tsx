import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Share2, Download, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import qrImage from "@/assets/qr-rewardloop.png";
import logo from "@/assets/rewardloop-logo.png";

const SHARE_URL = "https://rewardloop.fun";
const SHARE_TITLE = "RewardLoop — Play. Earn. Redeem.";
const SHARE_TEXT =
  "Complete missions, spin the wheel, and earn real rewards on RewardLoop.";

export const Route = createFileRoute("/share")({
  component: SharePage,
  head: () => ({
    meta: [
      { title: "Share RewardLoop — QR Code & Link" },
      {
        name: "description",
        content:
          "Scan the QR code or copy the link to share RewardLoop with friends.",
      },
      { property: "og:title", content: "Share RewardLoop" },
      {
        property: "og:description",
        content: "Scan, copy, or share the link to RewardLoop.",
      },
    ],
  }),
});

function SharePage() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const onShare = async () => {
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL });
      } catch {
        /* user cancelled */
      }
    } else {
      onCopy();
    }
  };

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = qrImage;
    a.download = "rewardloop-qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <Link to="/" aria-label="Back" className="text-brand-foreground">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold text-brand-foreground">Share RewardLoop</h1>
      </header>

      <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-2xl mb-3"
          />
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Play. Earn. Redeem.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Scan the QR code or share the link to invite friends to RewardLoop.
          </p>

          <div className="mt-6 bg-card border border-border rounded-3xl p-5 card-shadow">
            <img
              src={qrImage}
              alt="QR code linking to rewardloop.fun"
              width={280}
              height={280}
              className="h-64 w-64 sm:h-72 sm:w-72 rounded-2xl"
            />
            <p className="mt-3 text-sm font-bold text-foreground tracking-wide">
              rewardloop.fun
            </p>
          </div>

          <div className="mt-6 w-full space-y-2">
            <button
              onClick={onShare}
              className="w-full pill-btn bg-primary text-primary-foreground brand-shadow flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" /> Share link
            </button>
            <button
              onClick={onCopy}
              className="w-full pill-btn bg-card border border-border text-foreground flex items-center justify-center gap-2"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button
              onClick={onDownload}
              className="w-full pill-btn bg-card border border-border text-foreground flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Download QR code
            </button>
          </div>
        </div>
      </main>

      <footer className="px-5 py-6 text-center text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">·</span>
        <Link to="/legal" className="hover:text-foreground">Legal</Link>
      </footer>
    </div>
  );
}
