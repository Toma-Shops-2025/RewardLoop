import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";
import { IconFlame } from "../components/Icons";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

export const SceneStreak = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const flameSp = spring({ frame: frame - 10, fps, config: { damping: 10, stiffness: 80 } });
  const count = Math.floor(interpolate(frame, [25, 75], [1, 28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const flameWobble = Math.sin(frame / 6) * 0.06;
  const days = Array.from({ length: 7 });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: 60 }}>
      <div style={{
        fontSize: 84, fontWeight: 800, color: C.cream, letterSpacing: -2,
        textAlign: "center", lineHeight: 1.05, opacity: headOp, marginBottom: 40,
      }}>
        Build your <span style={{ color: C.orangeBright }}>streak.</span>
      </div>

      <div style={{
        transform: `scale(${flameSp + flameWobble})`,
        filter: "drop-shadow(0 0 80px rgba(245,158,11,0.85))",
        marginBottom: 10,
      }}><IconFlame size={300} /></div>

      <div style={{
        fontSize: 200, fontWeight: 800, color: C.orangeBright, letterSpacing: -8, lineHeight: 1,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
      }}>{count}</div>
      <div style={{
        fontFamily: body, fontWeight: 700, fontSize: 36, color: C.cream, letterSpacing: 6, marginTop: 8,
        opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
      }}>DAY STREAK</div>

      <div style={{ display: "flex", gap: 16, marginTop: 50 }}>
        {days.map((_, i) => {
          const sp = spring({ frame: frame - 60 - i * 5, fps, config: { damping: 18 } });
          return (
            <div key={i} style={{
              width: 90, height: 90, borderRadius: 24,
              background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 56, color: "#fff", fontWeight: 800, lineHeight: 1,
              transform: `scale(${sp})`, opacity: sp,
              boxShadow: "0 12px 24px rgba(234,88,12,0.4)",
            }}>✓</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
