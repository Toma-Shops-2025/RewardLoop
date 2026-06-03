import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

// 16:9 landscape promo, ~28s @ 30fps
// Scene durations sum to 920 frames, 6 transitions × 15 frames overlap = 830 final frames
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={830}
    fps={30}
    width={1920}
    height={1080}
  />
);
