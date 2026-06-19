import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  interpolate,
  spring,
  Img,
} from "remotion";
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont as loadDisplay } from "@remotion/google-fonts/Sora";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { C, gradDark } from "./theme";

const display = loadDisplay("normal", { weights: ["700", "800"] }).fontFamily;
const body = loadBody("normal", { weights: ["500", "700", "800"] }).fontFamily;

/* ------------ shared background ------------ */
const FloatingDots = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dots = Array.from({ length: 36 });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dots.map((_, i) => {
        const seed = i * 213.7;
        const x = seed % width;
        const baseY = (seed * 1.7) % height;
        const drift = Math.sin((frame + i * 20) / 40) * 30;
        const op = 0.12 + (i % 3) * 0.07;
        const size = 4 + (i % 4) * 2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: baseY + drift,
              width: size,
              height: size,
              borderRadius: 9999,
              background: i % 2 ? C.orangeBright : C.gold,
              opacity: op,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Vignette = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

const BackgroundMusic = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const volume = interpolate(
    frame,
    [0, 12, durationInFrames - 30, durationInFrames],
    [0, 0.55, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  try {
    return <Audio src={staticFile("audio/bg.mp3")} volume={volume} />;
  } catch {
    return null;
  }
};

/* ------------ reusable phone frame (vertical) ------------ */
const PhoneFrame: React.FC<{ children: React.ReactNode; w?: number; h?: number }> = ({
  children,
  w = 620,
  h = 1280,
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 70,
      background: "#fff",
      padding: 14,
      boxShadow: "0 40px 80px rgba(0,0,0,0.55), 0 0 0 6px #1c1917",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 56,
        background: C.cream,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {children}
    </div>
    {/* notch */}
    <div
      style={{
        position: "absolute",
        top: 22,
        left: "50%",
        transform: "translateX(-50%)",
        width: 180,
        height: 32,
        borderRadius: 9999,
        background: "#1c1917",
      }}
    />
  </div>
);

/* ============= SCENE 1: LOGO ============= */
const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconSp = spring({ frame, fps, config: { damping: 12, stiffness: 110 } });
  const titleOp = interpolate(frame, [12, 35], [0, 1], { extrapolateRight: "clamp" });
  const tagOp = interpolate(frame, [28, 55], [0, 1], { extrapolateRight: "clamp" });
  const glow = 0.4 + Math.sin(frame / 6) * 0.2;
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: display,
        flexDirection: "column",
        gap: 50,
      }}
    >
      <div
        style={{
          width: 360,
          height: 360,
          transform: `scale(${iconSp})`,
          filter: `drop-shadow(0 0 80px rgba(245,158,11,${glow}))`,
        }}
      >
        <Img
          src={staticFile("images/icon.png")}
          style={{ width: "100%", height: "100%", borderRadius: 80 }}
        />
      </div>
      <div style={{ textAlign: "center", opacity: titleOp }}>
        <div
          style={{
            fontSize: 130,
            fontWeight: 800,
            color: C.cream,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          Reward<span style={{ color: C.orangeBright }}>Loop</span>
        </div>
        <div
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 34,
            color: C.cream,
            opacity: tagOp * 0.85,
            marginTop: 22,
            letterSpacing: 10,
          }}
        >
          PLAY · EARN · REDEEM
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 2: HOOK ============= */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lineSp = (d: number) =>
    spring({ frame: frame - d, fps, config: { damping: 16 } });
  const a = lineSp(0);
  const b = lineSp(18);
  const c = lineSp(36);
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        fontFamily: display,
        padding: "0 80px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 160,
          fontWeight: 800,
          color: C.cream,
          letterSpacing: -6,
          lineHeight: 0.95,
          transform: `translateY(${(1 - a) * 60}px)`,
          opacity: a,
        }}
      >
        Turn play
      </div>
      <div
        style={{
          fontSize: 160,
          fontWeight: 800,
          color: C.cream,
          letterSpacing: -6,
          lineHeight: 0.95,
          marginTop: 10,
          transform: `translateY(${(1 - b) * 60}px)`,
          opacity: b,
        }}
      >
        into
      </div>
      <div
        style={{
          fontSize: 180,
          fontWeight: 800,
          letterSpacing: -7,
          lineHeight: 0.95,
          marginTop: 16,
          color: C.orangeBright,
          textShadow: "0 0 60px rgba(245,158,11,0.6)",
          transform: `translateY(${(1 - c) * 60}px)`,
          opacity: c,
        }}
      >
        real rewards.
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 3: MISSIONS ============= */
const missions = [
  { title: "Daily Login", reward: "+50", done: true },
  { title: "Watch a Video", reward: "+100", done: true },
  { title: "Play Trivia", reward: "+150", done: false },
  { title: "Spin the Wheel", reward: "+75", done: false },
];
const SceneMissions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headSp = spring({ frame, fps, config: { damping: 16 } });
  const phoneSp = spring({ frame: frame - 8, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 110,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontFamily: body,
          fontSize: 28,
          letterSpacing: 8,
          color: C.orangeBright,
          fontWeight: 700,
          opacity: headSp,
        }}
      >
        DAILY MISSIONS
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          color: C.cream,
          letterSpacing: -3,
          lineHeight: 1,
          marginTop: 14,
          textAlign: "center",
          opacity: headSp,
          transform: `translateY(${(1 - headSp) * 30}px)`,
        }}
      >
        Simple tasks.
        <br />
        <span style={{ color: C.orangeBright }}>Real points.</span>
      </div>
      <div
        style={{
          marginTop: 50,
          transform: `translateY(${(1 - phoneSp) * 200}px)`,
          opacity: phoneSp,
        }}
      >
        <PhoneFrame w={620} h={1100}>
          <div style={{ padding: "80px 28px 28px", fontFamily: body }}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 800,
                fontSize: 38,
                color: C.ink,
              }}
            >
              Today's Missions
            </div>
            <div style={{ fontSize: 22, color: "#78716c", marginTop: 4 }}>
              2 of 4 complete
            </div>
            <div
              style={{
                height: 14,
                background: "#fde6c8",
                borderRadius: 9999,
                overflow: "hidden",
                marginTop: 22,
                marginBottom: 26,
              }}
            >
              <div
                style={{
                  width: `${interpolate(frame, [40, 90], [0, 50], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.orangeBright}, ${C.orangeDeep})`,
                }}
              />
            </div>
            {missions.map((m, i) => {
              const sp = spring({
                frame: frame - 35 - i * 10,
                fps,
                config: { damping: 18 },
              });
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "20px 22px",
                    background: "#fff",
                    borderRadius: 22,
                    marginBottom: 14,
                    boxShadow: "0 6px 18px rgba(245,158,11,0.14)",
                    transform: `translateX(${(1 - sp) * 80}px)`,
                    opacity: sp,
                    border: `2px solid ${m.done ? "#fde6c8" : "transparent"}`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 9999,
                      background: m.done ? C.green : "#fde6c8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 26,
                    }}
                  >
                    {m.done ? "✓" : ""}
                  </div>
                  <div
                    style={{ flex: 1, fontWeight: 700, fontSize: 24, color: C.ink }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
                      color: "#fff",
                      padding: "8px 18px",
                      borderRadius: 9999,
                      fontWeight: 800,
                      fontSize: 22,
                      fontFamily: display,
                    }}
                  >
                    {m.reward}
                  </div>
                </div>
              );
            })}
          </div>
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 4: GAMES ============= */
const games = [
  { name: "Spin", icon: "🎡", color: "#f59e0b" },
  { name: "Trivia", icon: "🧠", color: "#ea580c" },
  { name: "Tap Dash", icon: "⚡", color: "#fbbf24" },
  { name: "Scratch", icon: "🎟️", color: "#dc2626" },
];
const SceneGames: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headSp = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 60,
        padding: "0 60px",
      }}
    >
      <div style={{ textAlign: "center", opacity: headSp }}>
        <div
          style={{
            fontFamily: body,
            fontSize: 28,
            letterSpacing: 8,
            color: C.orangeBright,
            fontWeight: 700,
          }}
        >
          MINI GAMES
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: C.cream,
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          Quick.<br />
          <span style={{ color: C.orangeBright }}>Addictive.</span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 36,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {games.map((g, i) => {
          const sp = spring({ frame: frame - 20 - i * 8, fps, config: { damping: 14 } });
          const bob = Math.sin((frame + i * 12) / 14) * 6;
          return (
            <div
              key={i}
              style={{
                background: `linear-gradient(135deg, ${g.color}, ${C.orangeDeep})`,
                borderRadius: 40,
                padding: "60px 30px",
                textAlign: "center",
                color: "#fff",
                boxShadow: "0 24px 50px rgba(0,0,0,0.4)",
                transform: `scale(${sp}) translateY(${bob}px)`,
                opacity: sp,
              }}
            >
              <div style={{ fontSize: 130, lineHeight: 1 }}>{g.icon}</div>
              <div
                style={{
                  fontSize: 50,
                  fontWeight: 800,
                  marginTop: 18,
                  letterSpacing: -1,
                }}
              >
                {g.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 5: STREAK ============= */
const SceneStreak: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headSp = spring({ frame, fps, config: { damping: 16 } });
  const days = [1, 2, 3, 4, 5, 6, 7];
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 60,
        padding: "0 60px",
      }}
    >
      <div style={{ textAlign: "center", opacity: headSp }}>
        <div
          style={{
            fontFamily: body,
            fontSize: 28,
            letterSpacing: 8,
            color: C.orangeBright,
            fontWeight: 700,
          }}
        >
          DAILY STREAK
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: C.cream,
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          Come back.<br />
          <span style={{ color: C.orangeBright }}>Bonus stacks.</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", maxWidth: 900 }}>
        {days.map((d, i) => {
          const sp = spring({ frame: frame - 18 - i * 6, fps, config: { damping: 14 } });
          const active = i < 5;
          return (
            <div
              key={i}
              style={{
                width: 110,
                height: 140,
                borderRadius: 26,
                background: active
                  ? `linear-gradient(180deg, ${C.orangeBright}, ${C.orangeDeep})`
                  : "rgba(255,255,255,0.08)",
                border: active ? "none" : "2px dashed rgba(255,247,237,0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: active ? "#fff" : C.cream,
                transform: `scale(${sp})`,
                opacity: sp,
                boxShadow: active ? "0 12px 30px rgba(245,158,11,0.45)" : "none",
              }}
            >
              <div style={{ fontFamily: body, fontSize: 16, opacity: 0.85, letterSpacing: 2 }}>
                DAY
              </div>
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{d}</div>
              {active && <div style={{ fontSize: 28, marginTop: 4 }}>🔥</div>}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 6: REDEEM ============= */
const rewards = [
  { label: "PayPal Cash", icon: "💵" },
  { label: "Gift Cards", icon: "🎁" },
  { label: "Crypto", icon: "₿" },
];
const SceneRedeem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headSp = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 60,
        padding: "0 60px",
      }}
    >
      <div style={{ textAlign: "center", opacity: headSp }}>
        <div
          style={{
            fontFamily: body,
            fontSize: 28,
            letterSpacing: 8,
            color: C.orangeBright,
            fontWeight: 700,
          }}
        >
          CASH OUT
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: C.cream,
            letterSpacing: -4,
            lineHeight: 1,
            marginTop: 14,
          }}
        >
          Real money.<br />
          <span style={{ color: C.orangeBright }}>Real fast.</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%", maxWidth: 720 }}>
        {rewards.map((r, i) => {
          const sp = spring({ frame: frame - 20 - i * 10, fps, config: { damping: 16 } });
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "30px 40px",
                background: "rgba(255,247,237,0.08)",
                border: "2px solid rgba(245,158,11,0.4)",
                borderRadius: 30,
                backdropFilter: "blur(6px)",
                transform: `translateX(${(1 - sp) * 100}px)`,
                opacity: sp,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 22,
                  background: `linear-gradient(135deg, ${C.orangeBright}, ${C.orangeDeep})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 56,
                  boxShadow: "0 10px 24px rgba(245,158,11,0.5)",
                }}
              >
                {r.icon}
              </div>
              <div
                style={{
                  fontSize: 54,
                  fontWeight: 800,
                  color: C.cream,
                  letterSpacing: -1,
                }}
              >
                {r.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 7: GOOGLE PLAY CTA ============= */
const SceneGooglePlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const badgeSp = spring({ frame: frame - 18, fps, config: { damping: 12 } });
  const arrowBob = Math.sin(frame / 8) * 10;
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 70,
        padding: "0 60px",
      }}
    >
      <div
        style={{
          fontSize: 130,
          fontWeight: 800,
          color: C.cream,
          letterSpacing: -5,
          lineHeight: 0.95,
          textAlign: "center",
          opacity: titleOp,
          transform: `translateY(${(1 - titleOp) * 40}px)`,
        }}
      >
        Download<br />
        <span style={{ color: C.orangeBright }}>FREE today.</span>
      </div>
      <div
        style={{
          padding: "36px 70px",
          borderRadius: 9999,
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 26,
          transform: `scale(${badgeSp})`,
          opacity: badgeSp,
          boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 0 4px rgba(245,158,11,0.4)",
        }}
      >
        <svg width="80" height="80" viewBox="0 0 24 24" fill="#fff">
          <path d="M6 4l14 8-14 8z" />
        </svg>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: body, fontSize: 26, opacity: 0.8, letterSpacing: 2 }}>
            GET IT ON
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
            Google Play
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: body,
          fontSize: 38,
          fontWeight: 700,
          color: C.cream,
          opacity: 0.85,
          transform: `translateY(${arrowBob}px)`,
        }}
      >
        ↓ Scan below ↓
      </div>
    </AbsoluteFill>
  );
};

/* ============= SCENE 8: QR ENDCARD (last 5s) ============= */
const SceneQR: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoSp = spring({ frame, fps, config: { damping: 14 } });
  const qrSp = spring({ frame: frame - 14, fps, config: { damping: 14 } });
  const urlOp = interpolate(frame, [32, 55], [0, 1], { extrapolateRight: "clamp" });
  const ctaOp = interpolate(frame, [44, 70], [0, 1], { extrapolateRight: "clamp" });
  const pulse = 1 + Math.sin(frame / 10) * 0.02;
  return (
    <AbsoluteFill
      style={{
        fontFamily: display,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 50,
        padding: "0 80px",
      }}
    >
      {/* Brand row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: logoSp,
          transform: `scale(${logoSp})`,
        }}
      >
        <Img
          src={staticFile("images/icon.png")}
          style={{ width: 130, height: 130, borderRadius: 30 }}
        />
        <div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              color: C.cream,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            Reward<span style={{ color: C.orangeBright }}>Loop</span>
          </div>
          <div
            style={{
              fontFamily: body,
              fontWeight: 700,
              fontSize: 22,
              color: C.orangeBright,
              letterSpacing: 6,
              marginTop: 8,
            }}
          >
            PLAY · EARN · REDEEM
          </div>
        </div>
      </div>

      {/* QR card */}
      <div
        style={{
          background: C.cream,
          padding: 40,
          borderRadius: 40,
          boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 6px rgba(245,158,11,0.6)",
          transform: `scale(${qrSp * pulse})`,
          opacity: qrSp,
        }}
      >
        <Img
          src={staticFile("images/qr.png")}
          style={{ width: 720, height: 720, display: "block" }}
        />
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: display,
            fontSize: 44,
            fontWeight: 800,
            color: C.orangeDeep,
            letterSpacing: -1,
            opacity: urlOp,
          }}
        >
          rewardloop.fun
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          fontFamily: display,
          fontSize: 56,
          fontWeight: 800,
          color: C.cream,
          letterSpacing: -1,
          opacity: ctaOp,
          textAlign: "center",
        }}
      >
        ← Scan to join
      </div>
    </AbsoluteFill>
  );
};

/* ============= MAIN ============= */
export const MainVideoVertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: gradDark }}>
      <FloatingDots />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={95}>
          <SceneLogo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <SceneMissions />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <SceneGames />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={125}>
          <SceneStreak />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneRedeem />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={115}>
          <SceneGooglePlay />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneQR />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Vignette />
      <BackgroundMusic />
    </AbsoluteFill>
  );
};
