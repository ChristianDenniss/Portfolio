# Portfolio Website

Christian Dennis — Halo-themed personal portfolio (Next.js on Vercel).

## Features

- **Halo main menu** — full-bleed menu video loops, themed SFX, and route backgrounds treated as product media (not a Lighthouse tradeoff)
- **Missions** — project briefings + dossiers with live demos, repos, and attached media
- **Personnel File** — About stories, campaigns (experience), loadout (skills), training, commendations
- **Cortana** — shipboard AI with streaming chat, tool-first navigation, intent shortcuts, Web Speech VO, and a 3D hologram bust
- **Contact uplink** — mailto form, map modal, Cortana `fillContact` prefills
- **Audio settings** — theme/SFX mute, Cortana mark visibility, resume open SFX
- **Git LFS media ops** — menu MP4s via LFS, warm-cache, prebuild guard against pointer stubs

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **3D**: React Three Fiber / Three.js
- **AI**: Vercel AI SDK + OpenAI
- **Deployment**: Vercel (production branch: `halo-theme`)

## Cortana (shipboard AI)

Halo-style portfolio assistant named Cortana (OpenAI `gpt-5-nano` + minimal reasoning, streaming). Tools: `navigate`, `openContent`, `openResume`, `fillContact`, `endSession`. Routes: `/`, `/projects`, `/about`, `/contact`, `/settings`.

**Talk animation POC:** `npm run cortana:talk-poc` (or open `/?menu=1&talkpoc=1`). Auto-opens the panel with jaw/lip bone speech + cycling demo lines.

**3D avatar (default):** Garry's Mod Cortana3DrigV2 with baked `mouthOpen` + Source facial bones, served as `public/models/auntie-dot.glb`. Re-import: `npm run cortana:import-gmod`. Bake mouth onto the active GLB: `npm run cortana:bake-gmod-mouth`. Sketchfab v1 is archived at `public/models/archived/v1/` — force with `?cortana=v1`. Candidate staging GLB: `?cortana=gmod`.

**Guardrails (server / IP — closing the panel does not reset):** 280 chars/message, 4s min gap, 8 req/min burst, 25/hour, 60/day, duplicate text rejected for 30s, last 10 messages in context, `maxOutputTokens` 400.

### Local

1. Add to `.env.local` (never commit):

```bash
OPENAI_API_KEY=sk-...
```

2. Restart `npm run dev`.

Without the key, the panel shows `Uplink denied // No auth token`.

### Production (Vercel)

Project → **Settings → Environment Variables** → `OPENAI_API_KEY` → redeploy.

## Media fidelity

Halo-style menu media is treated as a product feature, not a Lighthouse tradeoff.

- **Warm-all stays on.** First visit still preloads/warms all menu background clips and the theme loop so route changes feel instant. We do **not** route-scope or Save-Data-gate those assets.
- **Quality bar.** Same resolution / sample rate as the shipped masters. Only perceptually lossless re-encodes are allowed (not bit-identical). Intentional downscales (e.g. 720p) or aggressive CRF that trades fidelity for size are out of policy.
- **What we tried.** High-quality re-encodes of `theme.mp3` (~257 kbps) and the Hero 1080p loop did not beat the current files without growing or barely shrinking them, so those assets were left unchanged. Full 4K menu re-encodes at CRF 18 were abandoned as impractically slow; originals stay as-is.
- **Masters.** Prior LFS revisions remain the archive. Web-served paths under `public/` are the live files visitors get.
- **Visitor-facing note.** The Projects page includes a **Portfolio site** card describing this decision.

## Git LFS (menu videos)

Menu background MP4s under `public/` are stored with **Git LFS**. Git keeps pointers; the real binaries must be checked out wherever Next serves `public/`.

### Local

```bash
git lfs install
git lfs pull
# or
npm run lfs:pull
```

`npm run dev` / `npm run build` run `scripts/ensure-lfs-videos.mjs`. Locally, if a menu `.mp4` is still a pointer, the script runs `git lfs pull`.

### Production (Vercel)

`ensure-lfs-videos.mjs` does **not** pull on CI/Vercel. The platform must materialize LFS on clone:

1. Vercel project → **Settings → Git → Git Large File Storage (LFS)** → enable
2. **Redeploy** (required after turning LFS on)

If LFS is off, the deploy ships pointer stubs and menu videos will not play; `prebuild` fails loudly instead of shipping broken MP4s.

## License

This project is open source and available under the [MIT License](LICENSE).
