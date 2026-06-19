import { Composition } from "remotion";
import { MainVideoVertical } from "./MainVideoVertical";

// 9:16 vertical promo, ~30s @ 30fps for TikTok/Shorts/Reels
// Scene durations sum to 1005, 7 transitions × 15 overlap = 900 final frames
export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideoVertical}
    durationInFrames={900}
    fps={30}
    width={1080}
    height={1920}
  />
);
