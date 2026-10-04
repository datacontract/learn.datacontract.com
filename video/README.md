# Walkthrough Videos

Records one silent walkthrough video per tutorial chapter, with English and German captions.

```bash
cd video
npm install
node record.mjs contract   # writes tutorial/public/videos/contract.{mp4,webp,en.vtt,de.vtt}
```

- `scenes/<slug>.mjs` describes a chapter as scenes: `card` (title card), `terminal` (typed commands with the real example output from the chapter, see `lib/mdx.mjs`), `image` (a screenshot with a slow pan), and `browser` (a live, scripted browser session, e.g. the Data Contract Editor started with `startEditor` from `lib/browser.mjs`).
- Each scene adds caption cues with `cue({ en, de })`; `record.mjs` turns them into WebVTT files.
- Requirements: Node.js, ffmpeg, cwebp, uv, and the workshop database (`docker compose up -d`) for scenes that run tests.
- Set `video: true` for the chapter in `tutorial/src/chapters.ts` to show the player.
