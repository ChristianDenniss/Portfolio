# Portfolio Website

my personal portfiliooooooOOOOOO hi

## Features

- **Modern Design**: Clean and professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Fast Performance**: Built with Next.js for optimal performance
- **SEO Optimized**: Meta tags and structured data for better SEO
- **Contact Form**: Functional contact form for easy communication
- **Project Showcase**: Beautiful project cards with links to live demos and code
- **Skills Section**: Interactive skills display with progress bars
- **Smooth Animations**: Framer Motion animations for enhanced user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## Media fidelity

Halo-style menu media is treated as a product feature, not a Lighthouse tradeoff.

- **Warm-all stays on.** First visit still preloads/warms all menu background clips and the theme loop so route changes feel instant. We do **not** route-scope or Save-Data-gate those assets.
- **Quality bar.** Same resolution / sample rate as the shipped masters. Only perceptually lossless re-encodes are allowed (not bit-identical). Intentional downscales (e.g. 720p) or aggressive CRF that trades fidelity for size are out of policy.
- **What we tried.** High-quality re-encodes of `theme.mp3` (~257 kbps) and the Hero 1080p loop did not beat the current files without growing or barely shrinking them, so those assets were left unchanged. Full 4K menu re-encodes at CRF 18 were abandoned as impractically slow; originals stay as-is.
- **Masters.** Prior LFS revisions remain the archive. Web-served paths under `public/` are the live files visitors get.
- **Visitor-facing note.** The Projects page includes a **Portfolio site (Halo theme)** card describing this decision.

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

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
