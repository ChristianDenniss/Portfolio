# Portfolio Website

my personal portfiliooooooOOOOOO hi

## Features

- **Modern Design**: Clean and professional design with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Dark Mode**: Toggle between light and dark themes
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
