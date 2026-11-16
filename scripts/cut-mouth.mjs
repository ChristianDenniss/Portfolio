/**
 * Full mouth-cavity pipeline: Blender cut → restore transforms → production GLB.
 * Usage: npm run cortana:cut-mouth
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const blender = 'C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe'
const py = resolve('scripts/blender-mouth-cavity.py')
const finalize = resolve('scripts/finalize-mouth-cut.mjs')

if (!existsSync(blender)) {
  console.error('Blender not found at', blender)
  process.exit(1)
}

console.log('[cut-mouth] Blender cavity cut…')
const cut = spawnSync(blender, ['--background', '--python', py], {
  stdio: 'inherit',
  shell: false
})
if (cut.status !== 0) process.exit(cut.status ?? 1)

console.log('[cut-mouth] Finalize transforms → auntie-dot.glb…')
const fin = spawnSync(process.execPath, [finalize], { stdio: 'inherit' })
if (fin.status !== 0) process.exit(fin.status ?? 1)

console.log('[cut-mouth] Done. Hard-refresh talkpoc (?v= cache bust in AuntieDotAvatar).')
