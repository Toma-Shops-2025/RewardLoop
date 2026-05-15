import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";
import { IconSpin, IconTrivia, IconTapDash } from "../components/Icons";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

const games = [
  { name: "Spin", Icon: IconSpin, color: C.orangeBright },
  { name: "Trivia", Icon: IconTrivia, color: C.gold },
  { name: "Tap Dash", Icon: IconTapDash, color: C.orangeDeep },
];

export const SceneGames = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-40, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: 60 }}>
      <div style={{
        fontSize: 84, fontWeight: 800, color: C.cream, letterSpacing: -2,
        textAlign: "center", lineHeight: 1.05, opacity: headOp,
        transform: `translateY(${headY}px)`, marginBottom: 100,
      }}>
        Three games.<br /><span style={{ color: C.orangeBright }}>Endless fun.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, width: "100%", alignItems: "center" }}>
        {games.map((g, i) => {
          const sp = spring({ frame: frame - 25 - i * 14, fps, config: { damping: 14, stiffness: 100 } });
          const rot = interpolate(sp, [0, 1], [-8, 0]);
          const x = interpolate(sp, [0, 1], [i % 2 === 0 ? -600 : 600, 0]);
          const Icon = g.Icon;
          return (
            <div key={i} style={{
              width: 820, padding: "44px 56px", borderRadius: 36,
              background: `linear-gradient(135deg, ${g.color} 0%, ${C.orangeDeep} 100%)`,
              display: "flex", alignItems: "center", gap: 36,
              transform: `translateX(${x}px) rotate(${rot}deg)`, opacity: sp,
              boxShadow: "0 30px 60px rgba(234,88,12,0.4)",
            }}>
              <div style={{
                width: 140, height: 140, borderRadius: 32, background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Icon size={88} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: -1 }}>{g.name}</div>
                <div style={{ fontFamily: body, fontWeight: 500, fontSize: 28, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                  Earn up to {(i + 1) * 150} pts
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
