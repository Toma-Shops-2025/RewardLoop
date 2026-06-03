import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { C, gradDark } from "./theme";
import { SceneLogo } from "./scenes/SceneLogo";
import { SceneHook } from "./scenes/SceneHook";
import { SceneMissions } from "./scenes/SceneMissions";
import { SceneGames } from "./scenes/SceneGames";
import { SceneStreak } from "./scenes/SceneStreak";
import { SceneRedeem } from "./scenes/SceneRedeem";
import { SceneEnd } from "./scenes/SceneEnd";

const FloatingDots = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const dots = Array.from({ length: 42 });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {dots.map((_, i) => {
        const seed = i * 213.7;
        const x = (seed % width);
        const baseY = ((seed * 1.7) % height);
        const drift = Math.sin((frame + i * 20) / 40) * 30;
        const op = 0.12 + (i % 3) * 0.07;
        const size = 4 + (i % 4) * 2;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: baseY + drift,
            width: size, height: size, borderRadius: 9999,
            background: i % 2 ? C.orangeBright : C.gold, opacity: op,
            filter: "blur(0.5px)",
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

// Subtle vignette so edges feel cinematic
const Vignette = () => (
  <AbsoluteFill style={{
    pointerEvents: "none",
    background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
  }} />
);

// Background music — only rendered if file exists in public/audio/bg.mp3
// Renderer will warn but not fail if missing; safe to leave wired.
const BackgroundMusic = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Fade in over first 12 frames, fade out over last 30
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

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: gradDark }}>
      <FloatingDots />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={90}><SceneLogo /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={120}><SceneHook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={160}><SceneMissions /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={170}><SceneGames /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={130}><SceneStreak /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={140}><SceneRedeem /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
        <TransitionSeries.Sequence durationInFrames={110}><SceneEnd /></TransitionSeries.Sequence>
      </TransitionSeries>
      <Vignette />
      <BackgroundMusic />
    </AbsoluteFill>
  );
};
