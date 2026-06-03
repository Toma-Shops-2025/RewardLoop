import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500"] }).fontFamily;

export const SceneLogo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconScale = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const iconRot = interpolate(frame, [0, 50], [-20, 0], { extrapolateRight: "clamp" });
  const titleX = interpolate(spring({ frame: frame - 12, fps, config: { damping: 18 } }), [0, 1], [80, 0]);
  const titleOp = interpolate(frame, [12, 40], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" });
  const glow = 0.45 + Math.sin(frame / 8) * 0.15;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display }}>
      <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <div style={{
          width: 280, height: 280,
          transform: `scale(${iconScale}) rotate(${iconRot}deg)`,
          filter: `drop-shadow(0 0 80px rgba(245,158,11,${glow}))`,
        }}>
          <Img src={staticFile("images/icon.png")} style={{ width: "100%", height: "100%", borderRadius: 64 }} />
        </div>
        <div style={{ transform: `translateX(${titleX}px)`, opacity: titleOp }}>
          <div style={{ fontSize: 160, fontWeight: 800, color: C.cream, letterSpacing: -5, lineHeight: 1 }}>
            Reward<span style={{ color: C.orangeBright }}>Loop</span>
          </div>
          <div style={{
            fontFamily: body, fontWeight: 500, marginTop: 18,
            fontSize: 38, color: C.cream, opacity: tagOp * 0.75, letterSpacing: 8,
          }}>
            PLAY · EARN · REDEEM
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
