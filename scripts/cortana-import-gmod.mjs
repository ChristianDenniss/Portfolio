/**
 * Re-import Garry's Mod Cortana3DrigV2 via Blender + SourceIO → GLB.
 * Usage: npm run cortana:import-gmod
 *
 * Requires Blender 4.5+ with SourceIO installed (junction to tools/SourceIO).
 * Does not replace public/models/auntie-dot.glb (v1 stays active + archived).
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SCRIPT = resolve(ROOT, 'scripts/blender-import-cortana-gmod.py')
const BLENDER =
  process.env.BLENDER_PATH ||
  'C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe'

if (!existsSync(BLENDER)) {
  console.error('[cortana:import-gmod] Blender not found at', BLENDER)
  console.error('Set BLENDER_PATH to blender.exe')
  process.exit(1)
}
if (!existsSync(SCRIPT)) {
  console.error('[cortana:import-gmod] Missing', SCRIPT)
  process.exit(1)
}

console.log('[cortana:import-gmod] Running Blender SourceIO import…')
const child = spawn(BLENDER, ['--background', '--python', SCRIPT], {
  cwd: ROOT,
  stdio: 'inherit',
  shell: false
})
child.on('exit', (code) => {
  if (code === 0) {
    console.log('[cortana:import-gmod] Done. Preview: /?menu=1&talkpoc=1&cortana=gmod')
  }
  process.exit(code ?? 1)
})
