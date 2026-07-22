import { AbsoluteFill, Composition, Sequence } from "remotion";
import {
  BenefitCard,
  BigStatementScene,
  DriftGlow,
  FPS,
  FlashCut,
  IntroLineScene,
  IntroZoom,
  LightSweep,
  ProgressBar,
  TwoLineScene,
} from "./shared";

const HOOK = 60;
const PAIN = 50;
const BENEFITS_EACH = 50;
const BENEFITS = ["Ships in a weekend", "No stock transitions", "Fully typed props"];
const CTA = 60;

const TOTAL =
  HOOK + PAIN + BENEFITS_EACH * BENEFITS.length + CTA;

export const DemoReel: React.FC = () => {
  let cursor = 0;
  const hookAt = cursor;
  cursor += HOOK;
  const painAt = cursor;
  cursor += PAIN;
  const benefitStarts = BENEFITS.map((_, i) => {
    const at = cursor;
    cursor += BENEFITS_EACH;
    return at;
  });
  const ctaAt = cursor;

  return (
    <AbsoluteFill>
      <Sequence from={hookAt} durationInFrames={HOOK}>
        <IntroZoom>
          <TwoLineScene line1="Kinetic reels," line2="not slideshows." />
        </IntroZoom>
      </Sequence>

      <Sequence from={painAt} durationInFrames={PAIN}>
        <BigStatementScene>
          Most template kits look the same on every feed.
        </BigStatementScene>
      </Sequence>

      {BENEFITS.map((text, i) => (
        <Sequence key={text} from={benefitStarts[i]} durationInFrames={BENEFITS_EACH}>
          <BenefitCard text={text} index={i} total={BENEFITS.length} />
        </Sequence>
      ))}

      <Sequence from={ctaAt} durationInFrames={CTA}>
        <AbsoluteFill>
          <IntroLineScene text="Clone it, swap the copy, ship your own." />
          <DriftGlow />
        </AbsoluteFill>
      </Sequence>

      <FlashCut at={hookAt + HOOK} />
      <FlashCut at={painAt + PAIN} />
      {benefitStarts.map((at, i) => (
        <LightSweep key={i} at={at} />
      ))}

      <ProgressBar total={TOTAL} />
    </AbsoluteFill>
  );
};

export const DemoReelVideo: React.FC = () => (
  <Composition
    id="DemoReel"
    component={DemoReel}
    durationInFrames={TOTAL}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
