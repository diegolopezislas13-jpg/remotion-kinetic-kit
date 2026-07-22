# remotion-kinetic-kit

Reusable [Remotion](https://remotion.dev) components for kinetic-text social reels — the kind of fast, caption-driven vertical video used for Instagram/TikTok hooks, benefit lists, and CTAs. Instead of stock swipe/fade transitions, this kit ships hand-built entrances (blur + rise, 3D card-turn), flash cuts, and a soft light-sweep beat change.

## What's included

- **Scene primitives** — `TwoLineScene`, `BigStatementScene`, `IntroLineScene`, `BenefitCard`: typed, ready-to-use full-screen scenes for hooks, pain points, and numbered benefit lists.
- **Entrance hooks** — `useKineticIn`, `useKineticInX`, `useCardIn3D`: spring-based blur/scale/translate entrances you can apply to any element.
- **Transitions** — `FlashCut` (color-punch wipe) and `LightSweep` (soft radial glow pulse) for story-beat changes.
- **Ambient helpers** — `Backdrop` (navy gradient + film grain), `DriftGlow` (slow-drifting background glow), `IntroZoom` (subtle punch-in on the first frames), `ProgressBar`, `StepDots`.
- **Audio helpers** — `RiserSound`, `CameraFlashSound`, `BackgroundSong`: thin wrappers around Remotion's `<Audio>` that take a file in `/public` as a prop. No audio files are bundled — bring your own (see below).

See [`src/DemoReel.tsx`](src/DemoReel.tsx) for a full composition wired together, and [`src/shared.tsx`](src/shared.tsx) for the components themselves.

## Commands

```console
npm i
npm run dev      # opens Remotion Studio with the demo composition
npm run render   # renders the demo to out/demo.mp4
```

## Using this in your own project

1. Copy `src/shared.tsx` into your Remotion project (or depend on this repo directly).
2. Compose your own reel from the primitives, following the pattern in `src/DemoReel.tsx`.
3. If you use `RiserSound`, `CameraFlashSound`, or `BackgroundSong`, drop your own royalty-free audio into `public/` and pass the filename as `src`.

## Why no bundled audio or stock images

This kit intentionally ships with zero bundled media assets. Sound-effect and music licenses (Pixabay, Epidemic Sound, etc.) generally permit using the track *in a finished video*, not redistributing the raw file inside an open-source repo — so none is included here. Wire up your own licensed audio via the `src` props above.

## License

MIT — see [LICENSE](LICENSE).
