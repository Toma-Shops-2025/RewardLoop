import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

export const SceneEnd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconSp = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const titleOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });
  const badgeSp = spring({ frame: frame - 45, fps, config: { damping: 14 } });
  const glow = 0.4 + Math.sin(frame / 6) * 0.2;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display }}>
      <div style={{ display: "flex", alignItems: "center", gap: 50, marginBottom: 60 }}>
        <div style={{
          width: 220, height: 220, transform: `scale(${iconSp})`,
          filter: `drop-shadow(0 0 80px rgba(245,158,11,${glow}))`,
        }}>
          <Img src={staticFile("images/icon.png")} style={{ width: "100%", height: "100%", borderRadius: 50 }} />
        </div>
        <div>
          <div style={{
            fontSize: 140, fontWeight: 800, color: C.cream, letterSpacing: -4, lineHeight: 1, opacity: titleOp,
          }}>
            Reward<span style={{ color: C.orangeBright }}>Loop</span>
          </div>
          <div style={{
            fontFamily: body, fontWeight: 700, fontSize: 32, color: C.cream, opacity: tagOp * 0.8,
            marginTop: 14, letterSpacing: 8,
          }}>
            PLAY · EARN · REDEEM
          </div>
        </div>
      </div>

      <div style={{
        padding: "22px 56px", borderRadius: 9999,
        background: "#000", color: "#fff", display: "flex", alignItems: "center", gap: 18,
        transform: `scale(${badgeSp})`, opacity: badgeSp,
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l14 8-14 8z" /></svg>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: body, fontSize: 18, opacity: 0.8 }}>GET IT ON</div>
          <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>Google Play</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
