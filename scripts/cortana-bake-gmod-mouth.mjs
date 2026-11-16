/**
 * Bake mouthOpen onto the GMod Cortana GLB from facial bone pose.
 * Usage: npm run cortana:bake-gmod-mouth
 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SCRIPT = resolve(ROOT, 'scripts/blender-bake-gmod-mouth.py')
const BLENDER =
  process.env.BLENDER_PATH ||
  'C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe'

if (!existsSync(BLENDER)) {
  console.error('[cortana:bake-gmod-mouth] Blender not found:', BLENDER)
  process.exit(1)
}

console.log('[cortana:bake-gmod-mouth] Baking mouthOpen from jaw bones…')
const child = spawn(BLENDER, ['--background', '--python', SCRIPT], {
  cwd: ROOT,
  stdio: 'inherit'
})
child.on('exit', (code) => process.exit(code ?? 1))
