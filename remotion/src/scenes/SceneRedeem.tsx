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
  const headOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const points = Math.floor(interpolate(frame, [10, 50], [2480, 5000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: 60 }}>
      <div style={{
        fontSize: 84, fontWeight: 800, color: C.cream, letterSpacing: -2,
        textAlign: "center", lineHeight: 1.05, opacity: headOp, marginBottom: 30,
      }}>
        Redeem for <span style={{ color: C.orangeBright }}>real rewards.</span>
      </div>

      <div style={{
        marginTop: 20, padding: "30px 70px", borderRadius: 9999,
        background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
        boxShadow: "0 24px 50px rgba(234,88,12,0.5)",
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
        textAlign: "center",
      }}>
        <div style={{ fontFamily: body, fontWeight: 700, fontSize: 26, color: "rgba(255,255,255,0.9)", letterSpacing: 4 }}>
          YOUR BALANCE
        </div>
        <div style={{ fontSize: 110, fontWeight: 800, color: "#fff", letterSpacing: -3, lineHeight: 1, marginTop: 6 }}>
          {points.toLocaleString()} <span style={{ fontSize: 50 }}>pts</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, marginTop: 80, width: 880 }}>
        {cards.map((c, i) => {
          const sp = spring({ frame: frame - 40 - i * 8, fps, config: { damping: 16 } });
          return (
            <div key={i} style={{
              padding: 32, borderRadius: 28, background: c.color, color: "#fff",
              transform: `scale(${sp}) rotate(${(i % 2 ? 1 : -1) * (1 - sp) * 10}deg)`, opacity: sp,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", gap: 20,
              minHeight: 140,
            }}>
              <div style={{
                width: 84, height: 84, borderRadius: 18,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: c.apple ? 64 : 28, fontWeight: 800, letterSpacing: 0,
              }}>
                {c.apple ? (
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff"><path d="M17.5 12.5c0-2.7 2.2-3.9 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.6 2.8-2 3.4-.5 8.4 1.4 11.2.9 1.3 2 2.8 3.5 2.8 1.4 0 1.9-.9 3.6-.9 1.6 0 2.1.9 3.6.9 1.5 0 2.5-1.4 3.4-2.7 1.1-1.5 1.5-3 1.6-3.1-.1 0-3.1-1.2-3.1-4.7zM14.7 4.3C15.5 3.4 16 2.1 15.9 1c-1.1 0-2.4.7-3.2 1.6-.7.8-1.4 2.1-1.2 3.2 1.3.1 2.5-.6 3.2-1.5z"/></svg>
                ) : c.label}
              </div>
              <div>
                <div style={{ fontFamily: body, fontSize: 22, opacity: 0.7, fontWeight: 500 }}>Gift Card</div>
                <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>{c.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
