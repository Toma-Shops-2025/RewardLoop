import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

const cards = [
  { name: "Amazon", label: "AMZ", color: "#FF9900" },
  { name: "Visa", label: "VISA", color: "#1A1F71" },
  { name: "PayPal", label: "PP", color: "#003087" },
  { name: "Apple", label: "", color: "#1c1917", apple: true },
];

export const SceneRedeem = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-30, 0]);
  const balanceSp = spring({ frame: frame - 10, fps, config: { damping: 16 } });
  const points = Math.floor(interpolate(frame, [15, 60], [2480, 5000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: "0 140px" }}>
      <div style={{
        fontSize: 96, fontWeight: 800, color: C.cream, letterSpacing: -3,
        textAlign: "center", lineHeight: 1.05, opacity: headOp,
        transform: `translateY(${headY}px)`, marginBottom: 32,
      }}>
        Redeem for <span style={{ color: C.orangeBright }}>real rewards.</span>
      </div>

      <div style={{
        padding: "26px 90px", borderRadius: 9999,
        background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
        boxShadow: "0 24px 50px rgba(234,88,12,0.5)",
        opacity: balanceSp, transform: `scale(${balanceSp})`,
        textAlign: "center", marginBottom: 70,
      }}>
        <div style={{ fontFamily: body, fontWeight: 700, fontSize: 22, color: "rgba(255,255,255,0.9)", letterSpacing: 4 }}>
          YOUR BALANCE
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1, marginTop: 4 }}>
          {points.toLocaleString()} <span style={{ fontSize: 42 }}>pts</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 26, width: "100%", justifyContent: "center" }}>
        {cards.map((c, i) => {
          const sp = spring({ frame: frame - 40 - i * 8, fps, config: { damping: 16 } });
          return (
            <div key={i} style={{
              width: 320, padding: 32, borderRadius: 28, background: c.color, color: "#fff",
              transform: `scale(${sp}) rotate(${(i % 2 ? 1 : -1) * (1 - sp) * 8}deg)`, opacity: sp,
              boxShadow: "0 22px 44px rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{
                width: 84, height: 84, borderRadius: 18,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: c.apple ? 64 : 26, fontWeight: 800,
              }}>
                {c.apple ? (
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 12.5c0-2.7 2.2-3.9 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.4 1.4 11.2.9 1.3 2 2.8 3.5 2.8 1.4 0 1.9-.9 3.6-.9 1.6 0 2.1.9 3.6.9 1.5 0 2.5-1.4 3.4-2.7 1.1-1.5 1.5-3 1.6-3.1-.1 0-3.1-1.2-3.1-4.7zM14.7 4.3C15.5 3.4 16 2.1 15.9 1c-1.1 0-2.4.7-3.2 1.6-.7.8-1.4 2.1-1.2 3.2 1.3.1 2.5-.6 3.2-1.5z"/></svg>
                ) : c.label}
              </div>
              <div>
                <div style={{ fontFamily: body, fontSize: 18, opacity: 0.7, fontWeight: 500 }}>Gift Card</div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{c.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
