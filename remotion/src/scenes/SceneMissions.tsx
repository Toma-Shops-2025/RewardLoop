import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C } from "../theme";
import { Phone } from "../components/Phone";

const display = loadDisplay("normal", { weights: ["800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700"] }).fontFamily;

const missions = [
  { title: "Daily Login", reward: "+50", done: true },
  { title: "Watch Featured Video", reward: "+100", done: true },
  { title: "Play Trivia (3 rounds)", reward: "+150", done: false },
  { title: "Spin the Wheel", reward: "+75", done: false },
];

export const SceneMissions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(spring({ frame, fps, config: { damping: 18 } }), [0, 1], [40, 0]);
  const subOp = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp" });
  const phoneSp = spring({ frame: frame - 10, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ fontFamily: display, padding: "0 120px", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 100 }}>
      {/* Left: copy */}
      <div style={{ flex: 1, maxWidth: 700 }}>
        <div style={{
          fontFamily: body, fontWeight: 700, fontSize: 28, color: C.orangeBright, letterSpacing: 6,
          opacity: headOp, marginBottom: 24,
        }}>DAILY MISSIONS</div>
        <div style={{
          fontSize: 110, fontWeight: 800, color: C.cream, letterSpacing: -3, lineHeight: 1,
          opacity: headOp, transform: `translateY(${headY}px)`,
        }}>
          Simple tasks.<br /><span style={{ color: C.orangeBright }}>Real points.</span>
        </div>
        <div style={{
          fontFamily: body, fontWeight: 500, fontSize: 32, color: C.cream, opacity: subOp * 0.7,
          marginTop: 36, lineHeight: 1.4, maxWidth: 600,
        }}>
          A new set every day. Complete them, watch your balance climb.
        </div>
      </div>

      {/* Right: phone */}
      <div style={{ transform: `translateY(${(1 - phoneSp) * 200}px)`, opacity: phoneSp }}>
        <Phone width={460} height={940}>
          <div style={{ padding: "60px 26px 26px", fontFamily: body }}>
            <div style={{ fontFamily: display, fontWeight: 800, fontSize: 32, color: C.ink, marginBottom: 4 }}>
              Today's Missions
            </div>
            <div style={{ fontSize: 18, color: "#78716c", marginBottom: 22 }}>2 of 4 complete</div>
            <div style={{ height: 12, background: "#fde6c8", borderRadius: 9999, overflow: "hidden", marginBottom: 26 }}>
              <div style={{
                width: `${interpolate(frame, [40, 90], [0, 50], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%`,
                height: "100%", background: `linear-gradient(90deg, ${C.orangeBright}, ${C.orangeDeep})`,
              }} />
            </div>
            {missions.map((m, i) => {
              const sp = spring({ frame: frame - 40 - i * 10, fps, config: { damping: 18 } });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "18px 18px",
                  background: "#fff", borderRadius: 18, marginBottom: 12,
                  boxShadow: "0 4px 14px rgba(245,158,11,0.12)",
                  transform: `translateX(${(1 - sp) * 60}px)`, opacity: sp,
                  border: `2px solid ${m.done ? "#fde6c8" : "transparent"}`,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9999,
                    background: m.done ? C.green : "#fde6c8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 22,
                  }}>{m.done ? "✓" : ""}</div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 20, color: C.ink }}>{m.title}</div>
                  <div style={{
                    background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
                    color: "#fff", padding: "6px 14px", borderRadius: 9999,
                    fontWeight: 800, fontSize: 18, fontFamily: display,
                  }}>{m.reward}</div>
                </div>
              );
            })}
          </div>
        </Phone>
      </div>
    </AbsoluteFill>
  );
};
