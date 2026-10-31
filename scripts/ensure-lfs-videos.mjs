/**
 * Menu MP4s are Git LFS objects. Next serves `public/` as-is, so a leftover
 * pointer file breaks <video>.
 *
 * Local: if a pointer is detected, run `git lfs pull`.
 * CI / Vercel: never pull here. The host must materialize LFS on clone
 * (Vercel: Project Settings → Git → enable Git LFS, then redeploy).
 * This script only verifies real files are present and fails the build if not.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const MENU_VIDEOS = [
  'public/HaloAssetMimic/FMS_MainMenu_v2.mp4',
  'public/4K Videos/Halo 4 Menu.mp4',
  'public/4K Videos/Halo Customization Menu.mp4',
  'public/4K Videos/Halo Cross-Game Menu.mp4'
]

const LFS_POINTER_PREFIX = 'version https://git-lfs.github.com/spec/v1'
const isCi = Boolean(process.env.CI || process.env.VERCEL)

function looksLikePointer(filePath) {
  if (!fs.existsSync(filePath)) return true
  const fd = fs.openSync(filePath, 'r')
  try {
    const buf = Buffer.alloc(64)
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0)
    const head = buf.subarray(0, bytesRead).toString('utf8')
    return head.startsWith(LFS_POINTER_PREFIX)
  } finally {
    fs.closeSync(fd)
  }
}

const root = process.cwd()
const missingOrPointer = MENU_VIDEOS.map((rel) => path.join(root, rel)).filter(looksLikePointer)

if (missingOrPointer.length === 0) {
  process.exit(0)
}

const relativeBroken = missingOrPointer.map((filePath) => path.relative(root, filePath))

if (isCi) {
  console.error('[portfolio] Menu videos are missing or still Git LFS pointers in this build:')
  for (const rel of relativeBroken) console.error(`  - ${rel}`)
  console.error(
    '[portfolio] CI/Vercel does not pull LFS in this script. Enable Git LFS in the host clone, then redeploy.'
  )
  console.error('[portfolio] Vercel: Project Settings → Git → Git Large File Storage (LFS) → on → Redeploy.')
  process.exit(1)
}

console.warn(
  `[portfolio] ${missingOrPointer.length} menu video(s) are missing or still Git LFS pointers. Running git lfs pull…`
)

try {
  execSync('git lfs pull', { stdio: 'inherit', cwd: root })
} catch {
  console.error('[portfolio] git lfs pull failed. Install Git LFS, then run: git lfs pull')
  process.exit(1)
}

const stillBroken = MENU_VIDEOS.map((rel) => path.join(root, rel)).filter(looksLikePointer)
if (stillBroken.length > 0) {
  console.error('[portfolio] These menu videos are still not real MP4 files:')
  for (const filePath of stillBroken) console.error(`  - ${path.relative(root, filePath)}`)
  console.error('Run: git lfs install && git lfs pull')
  process.exit(1)
}

console.log('[portfolio] Menu videos are present locally (Git LFS objects checked out).')
