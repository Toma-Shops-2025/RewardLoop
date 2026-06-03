import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

const Coin = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
  const bob = Math.sin((frame + delay * 3) / 18) * 14;
  return (
    <div style={{
      position: "absolute", left: x, top: y + bob,
      width: 100, height: 100, borderRadius: 9999,
      background: `radial-gradient(circle at 35% 30%, ${C.gold}, ${C.orangeDeep})`,
      boxShadow: "0 18px 36px rgba(234,88,12,0.5), inset 0 0 0 6px rgba(255,255,255,0.18)",
      transform: `scale(${sp})`, opacity: sp,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontFamily: display, fontWeight: 800, fontSize: 52,
    }}>$</div>
  );
};

export const SceneHook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1Op = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const line1Y = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const line2Op = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const line2Y = interpolate(spring({ frame: frame - 18, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const subOp = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: display, padding: "0 140px", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ maxWidth: 1100 }}>
        <div style={{
          fontSize: 150, fontWeight: 800, color: C.cream, letterSpacing: -5, lineHeight: 1,
          opacity: line1Op, transform: `translateY(${line1Y}px)`,
        }}>
          Play games.
        </div>
        <div style={{
          fontSize: 150, fontWeight: 800, color: C.orangeBright, letterSpacing: -5, lineHeight: 1, marginTop: 10,
          opacity: line2Op, transform: `translateY(${line2Y}px)`,
        }}>
          Earn real rewards.
        </div>
        <div style={{
          fontFamily: body, fontWeight: 500, fontSize: 38, color: C.cream, opacity: subOp * 0.7,
          marginTop: 40, letterSpacing: 1,
        }}>
          Daily missions. Three mini-games. Real gift cards.
        </div>
      </div>
      <Coin delay={20} x={1500} y={180} />
      <Coin delay={32} x={1680} y={420} />
      <Coin delay={44} x={1520} y={680} />
      <Coin delay={56} x={1720} y={880} />
    </AbsoluteFill>
  );
};
