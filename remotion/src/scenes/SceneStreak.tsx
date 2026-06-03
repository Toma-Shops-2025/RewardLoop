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
  const flameSp = spring({ frame, fps, config: { damping: 10, stiffness: 80 } });
  const flameWobble = Math.sin(frame / 6) * 0.05;
  const headOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
  const headX = interpolate(spring({ frame: frame - 8, fps, config: { damping: 18 } }), [0, 1], [60, 0]);
  const count = Math.floor(interpolate(frame, [20, 70], [1, 28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const days = Array.from({ length: 7 });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: "0 140px", flexDirection: "row", gap: 80 }}>
      {/* Left: flame */}
      <div style={{
        transform: `scale(${flameSp + flameWobble})`,
        filter: "drop-shadow(0 0 90px rgba(245,158,11,0.85))",
      }}>
        <IconFlame size={460} />
      </div>

      {/* Right: counter + day boxes */}
      <div style={{ opacity: headOp, transform: `translateX(${headX}px)` }}>
        <div style={{
          fontFamily: body, fontWeight: 700, fontSize: 32, color: C.orangeBright, letterSpacing: 6, marginBottom: 10,
        }}>YOUR STREAK</div>
        <div style={{
          fontSize: 280, fontWeight: 800, color: C.cream, letterSpacing: -10, lineHeight: 0.9,
        }}>
          {count}<span style={{ fontSize: 90, color: C.orangeBright, marginLeft: 16 }}>days</span>
        </div>
        <div style={{
          fontFamily: body, fontWeight: 500, fontSize: 30, color: C.cream, opacity: 0.7, marginTop: 8, marginBottom: 36,
        }}>
          Keep your fire alive — multipliers grow daily.
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {days.map((_, i) => {
            const sp = spring({ frame: frame - 50 - i * 6, fps, config: { damping: 18 } });
            return (
              <div key={i} style={{
                width: 76, height: 76, borderRadius: 20,
                background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 44, color: "#fff", fontWeight: 800, lineHeight: 1,
                transform: `scale(${sp})`, opacity: sp,
                boxShadow: "0 12px 24px rgba(234,88,12,0.4)",
              }}>✓</div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
