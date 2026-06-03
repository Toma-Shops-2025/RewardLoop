import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";
import { IconSpin, IconTrivia, IconTapDash } from "../components/Icons";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

const games = [
  { name: "Spin", Icon: IconSpin, color: C.orangeBright, pts: "+75 pts", tag: "Daily wheel" },
  { name: "Trivia", Icon: IconTrivia, color: C.gold, pts: "+150 pts", tag: "Test your smarts" },
  { name: "Tap Dash", Icon: IconTapDash, color: C.orangeDeep, pts: "+200 pts", tag: "Reflex arcade" },
];

export const SceneGames = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [-40, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: display, padding: "0 120px" }}>
      <div style={{
        fontSize: 96, fontWeight: 800, color: C.cream, letterSpacing: -3,
        textAlign: "center", lineHeight: 1.05, opacity: headOp,
        transform: `translateY(${headY}px)`, marginBottom: 80,
      }}>
        Three games. <span style={{ color: C.orangeBright }}>Endless fun.</span>
      </div>
      <div style={{ display: "flex", gap: 50, width: "100%", justifyContent: "center" }}>
        {games.map((g, i) => {
          const sp = spring({ frame: frame - 30 - i * 14, fps, config: { damping: 14, stiffness: 100 } });
          const rot = interpolate(sp, [0, 1], [-6, 0]);
          const y = interpolate(sp, [0, 1], [200, 0]);
          const Icon = g.Icon;
          return (
            <div key={i} style={{
              width: 460, padding: "50px 40px 44px", borderRadius: 36,
              background: `linear-gradient(160deg, ${g.color} 0%, ${C.orangeDeep} 100%)`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
              transform: `translateY(${y}px) rotate(${rot}deg)`, opacity: sp,
              boxShadow: "0 30px 60px rgba(234,88,12,0.45)",
            }}>
              <div style={{
                width: 160, height: 160, borderRadius: 36, background: "rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}><Icon size={100} color="#fff" /></div>
              <div style={{ fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>{g.name}</div>
              <div style={{ fontFamily: body, fontWeight: 500, fontSize: 24, color: "rgba(255,255,255,0.85)" }}>
                {g.tag}
              </div>
              <div style={{
                marginTop: 4, padding: "10px 22px", borderRadius: 9999,
                background: "rgba(0,0,0,0.25)", color: "#fff",
                fontFamily: display, fontWeight: 800, fontSize: 24, letterSpacing: 0.5,
              }}>{g.pts}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
