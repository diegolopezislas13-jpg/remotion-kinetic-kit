import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["700", "900"],
});
export const { fontFamily: inter } = loadInter("normal", {
  weights: ["400", "600", "700", "800"],
});

export const NAVY = "#060E1A";
export const NAVY_2 = "#0A1830";
export const BLUE = "#3B82F6";
export const FPS = 30;

// subtle grain: kills gradient banding and reads as "shot on a premium camera" instead of flat vector art
const GRAIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`
)}`;

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundSize: "180px 180px",
      opacity: 0.05,
      mixBlendMode: "overlay",
      pointerEvents: "none",
    }}
  />
);

export const Backdrop: React.FC<{ tint?: string }> = ({ tint }) => (
  <AbsoluteFill style={{ backgroundColor: tint ?? NAVY }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 20%, rgba(59,130,246,0.16), transparent 65%)",
      }}
    />
    <Grain />
  </AbsoluteFill>
);

export const ProgressBar: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, total], [0, 100], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ height: 6, width: "100%", background: "rgba(255,255,255,0.08)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: BLUE }} />
      </div>
    </AbsoluteFill>
  );
};

// small punch-in on the very first frames only — a visual hook, not a sustained zoom
const INTRO_ZOOM_FRAMES = 22;
export const IntroZoom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, INTRO_ZOOM_FRAMES], [1.09, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};

// plays under the hook only — pair its durationInFrames with the hook's length so it gets cut
// off exactly at the next scene's transition. `src` is a file in /public you bring yourself
// (royalty-free sfx site of your choice) — none is bundled with this kit.
export const RiserSound: React.FC<{ src: string; durationInFrames: number }> = ({
  src,
  durationInFrames,
}) => (
  <Sequence from={0} durationInFrames={durationInFrames}>
    <Audio src={staticFile(src)} volume={0.9} />
  </Sequence>
);

const CAMERA_FLASH_FRAMES = 15; // exactly half a second, smooth fade so the cut isn't abrupt
export const CameraFlashSound: React.FC<{ src: string; at: number }> = ({ src, at }) => (
  <Sequence from={at} durationInFrames={CAMERA_FLASH_FRAMES}>
    <Audio src={staticFile(src)} volume={0.8} />
  </Sequence>
);

// background music bed — src is passed in so different versions/songs can share this component
export const BackgroundSong: React.FC<{
  src: string;
  from: number;
  durationInFrames: number;
}> = ({ src, from, durationInFrames }) => (
  <Sequence from={from} durationInFrames={durationInFrames}>
    <Audio src={staticFile(src)} volume={0.45} />
  </Sequence>
);

// quick color-punch wipe used only at the big story-beat changes, not between every cut
export const FlashCut: React.FC<{ at: number }> = ({ at }) => {
  const HALF = 5;
  return (
    <Sequence from={at - HALF} durationInFrames={HALF * 2}>
      <FlashCutInner half={HALF} />
    </Sequence>
  );
};

const FlashCutInner: React.FC<{ half: number }> = ({ half }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [0, half * 0.5, half, half * 1.5, half * 2],
    [0, 1, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BLUE,
        opacity: progress,
        transform: `scaleY(${0.15 + progress * 0.85})`,
      }}
    />
  );
};

// focus-pull entrance: blur + scale + rise, reads as "edited by a professional" rather than a slide-in
export const useKineticIn = (delay = 0, distance = 26) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 210, mass: 0.6 },
    durationInFrames: 16,
  });
  const blur = interpolate(local, [0, 11], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    opacity: local < 0 ? 0 : progress,
    filter: `blur(${Math.max(blur, 0)}px)`,
    transform: `translateY(${(1 - progress) * distance}px) scale(${
      0.94 + progress * 0.06
    })`,
  };
};

// same focus-pull, but slides in from a side instead of rising — used for off-center layouts
export const useKineticInX = (delay = 0, direction: "left" | "right" = "left", distance = 50) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 22, stiffness: 210, mass: 0.6 },
    durationInFrames: 16,
  });
  const blur = interpolate(local, [0, 11], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sign = direction === "left" ? -1 : 1;
  return {
    opacity: local < 0 ? 0 : progress,
    filter: `blur(${Math.max(blur, 0)}px)`,
    transform: `translateX(${sign * (1 - progress) * distance}px)`,
  };
};

// perspective card-turn entrance — heavier/more "designed" than the blur-rise, used for a reel
// that wants to feel distinct from the flash-cut reels without resorting to stock swipe/spin transitions
export const useCardIn3D = (delay = 0, direction: "left" | "right" = "left", distance = 70) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const progress = spring({
    frame: local,
    fps,
    config: { damping: 20, stiffness: 170, mass: 0.7 },
    durationInFrames: 18,
  });
  const blur = interpolate(local, [0, 13], [14, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sign = direction === "left" ? -1 : 1;
  return {
    opacity: local < 0 ? 0 : progress,
    filter: `blur(${Math.max(blur, 0)}px)`,
    transform: `perspective(900px) translateX(${sign * (1 - progress) * distance}px) rotateY(${
      sign * (1 - progress) * 24
    }deg) scale(${0.92 + progress * 0.08})`,
  };
};

// soft centered glow pulse at scene changes — a quiet "breath" of light instead of a moving
// streak/wipe graphic, reads as subtle and premium rather than a stock transition effect
export const LightSweep: React.FC<{ at: number }> = ({ at }) => {
  const DUR = 16;
  return (
    <Sequence from={at - 8} durationInFrames={DUR}>
      <LightSweepInner dur={DUR} />
    </Sequence>
  );
};

const LightSweepInner: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, dur * 0.45, dur],
    [0, 0.16, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.9), rgba(59,130,246,0.3) 55%, transparent 76%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// slow-drifting glow behind the content — subtle, but keeps a static card from reading as flat
export const DriftGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const x = 50 + Math.sin(frame / 45) * 8;
  const y = 22 + Math.cos(frame / 60) * 6;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${x}% ${y}%, rgba(59,130,246,0.16), transparent 62%)`,
        pointerEvents: "none",
      }}
    />
  );
};

export const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", maxWidth: 700 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === current ? 34 : 10,
          height: 10,
          borderRadius: 6,
          backgroundColor: i === current ? BLUE : "rgba(255,255,255,0.22)",
        }}
      />
    ))}
  </div>
);

// two-line kinetic statement, white first line + blue second line — used for hooks/value scenes
export const TwoLineScene: React.FC<{
  line1: string;
  line2: string;
  tint?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
}> = ({ line1, line2, tint, fontSize = 90, fontFamily: ff = playfair, fontWeight = 900 }) => {
  const l1 = useKineticIn(0);
  const l2 = useKineticIn(10);

  return (
    <AbsoluteFill>
      <Backdrop tint={tint} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: "220px 90px 340px" }}
      >
        <div
          style={{
            fontFamily: ff,
            fontWeight,
            fontSize,
            lineHeight: 1.16,
            color: "white",
            textAlign: "center",
            ...l1,
          }}
        >
          {line1}
        </div>
        <div
          style={{
            fontFamily: ff,
            fontWeight,
            fontSize,
            lineHeight: 1.16,
            color: BLUE,
            textAlign: "center",
            marginTop: 8,
            ...l2,
          }}
        >
          {line2}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// single bold centered statement (bigger/heavier than IntroLineScene) — used for "pain" beats
export const BigStatementScene: React.FC<{
  children: React.ReactNode;
  tint?: string;
  fontSize?: number;
}> = ({ children, tint, fontSize = 66 }) => {
  const style = useKineticIn(0, 18);

  return (
    <AbsoluteFill>
      <Backdrop tint={tint} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: "220px 90px 340px" }}
      >
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.28,
            color: "white",
            textAlign: "center",
            ...style,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const IntroLineScene: React.FC<{ text: string }> = ({ text }) => {
  const style = useKineticIn(0, 14);

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: "220px 90px 340px" }}
      >
        <div
          style={{
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 46,
            color: "white",
            textAlign: "center",
            letterSpacing: 0.3,
            ...style,
          }}
        >
          {text}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BenefitCard: React.FC<{
  text: string;
  index: number;
  total: number;
  fontSize?: number;
}> = ({ text, index, total, fontSize = 62 }) => {
  const style = useKineticIn(0, 22);
  const numberStyle = useKineticIn(2, 10);

  return (
    <AbsoluteFill>
      <Backdrop tint={index % 2 === 0 ? NAVY : NAVY_2} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", padding: "220px 100px 260px" }}
      >
        <div
          style={{
            fontFamily: inter,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: 6,
            color: BLUE,
            marginBottom: 26,
            ...numberStyle,
          }}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: inter,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.28,
            color: "white",
            textAlign: "center",
            ...style,
          }}
        >
          {text}
        </div>
        <div style={{ marginTop: 60 }}>
          <StepDots total={total} current={index} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
