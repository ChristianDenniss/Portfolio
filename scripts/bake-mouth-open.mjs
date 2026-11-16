/**
 * Bake a real `mouthOpen` morph into auntie-dot.glb.
 * Parts lip verts on the face mesh (bind-pose relative deltas) — no overlay planes.
 *
 * Usage: node scripts/bake-mouth-open.mjs [--dry]
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions'

const ROOT = resolve('public/models')
const SRC = resolve(ROOT, 'auntie-dot.glb')
const BAK = resolve(ROOT, 'auntie-dot.pre-mouth.glb')
const OUT = resolve(ROOT, 'auntie-dot.glb')
const dry = process.argv.includes('--dry')

const io = new NodeIO().registerExtensions([KHRMaterialsPBRSpecularGlossiness])
const doc = await io.read(SRC)
const root = doc.getRoot()

function meshLooksFace(mesh) {
  const n = (mesh.getName() || '').toLowerCase()
  if (n.includes('face')) return true
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial()
    if (mat && (mat.getName() || '').toLowerCase().includes('face')) return true
  }
  return false
}

const faceMesh = root.listMeshes().find(meshLooksFace)
if (!faceMesh) {
  console.error('No face mesh found')
  process.exit(1)
}

const prim = faceMesh.listPrimitives()[0]
const pos = prim.getAttribute('POSITION')
if (!pos) {
  console.error('Face mesh has no POSITION')
  process.exit(1)
}

const n = pos.getCount()
const xs = new Float32Array(n)
const ys = new Float32Array(n)
const zs = new Float32Array(n)
const tmp = [0, 0, 0]
for (let i = 0; i < n; i++) {
  pos.getElement(i, tmp)
  xs[i] = tmp[0]
  ys[i] = tmp[1]
  zs[i] = tmp[2]
}

const min = [Infinity, Infinity, Infinity]
const max = [-Infinity, -Infinity, -Infinity]
for (let i = 0; i < n; i++) {
  min[0] = Math.min(min[0], xs[i])
  min[1] = Math.min(min[1], ys[i])
  min[2] = Math.min(min[2], zs[i])
  max[0] = Math.max(max[0], xs[i])
  max[1] = Math.max(max[1], ys[i])
  max[2] = Math.max(max[2], zs[i])
}
const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
const midX = (min[0] + max[0]) / 2

// Profile: nose tip ~58% height; mouth crease ~40–46% (forward band below nose).
const lipCenterY = min[1] + size[1] * 0.42
const lipHalfH = size[1] * 0.1
const chinY = min[1] + size[1] * 0.2
const frontZ = min[2]

// Large enough to read at bust framing. Sealed topology still won't show a dark
 // oral cavity — that needs a Blender cut / new model — but lip+jaw motion must be obvious.
const lipOpen = size[1] * 0.22
const jawDrop = size[1] * 0.12
const backPush = size[2] * 0.08

const deltas = new Float32Array(n * 3)
let affected = 0
let upperN = 0
let lowerN = 0
let maxW = 0

for (let i = 0; i < n; i++) {
  const x = xs[i]
  const y = ys[i]
  const z = zs[i]

  const nx = (x - midX) / (size[0] * 0.5)
  const ny = (y - min[1]) / size[1]
  const nz = (z - frontZ) / size[2]

  if (Math.abs(nx) > 0.78) continue
  if (nz > 0.35) continue
  if (ny < 0.16 || ny > 0.56) continue

  const lateral = Math.exp(-nx * nx * 1.8)
  const depth = Math.exp(-nz * nz * 7)

  const lipDist = (y - lipCenterY) / lipHalfH
  const lipW = Math.exp(-lipDist * lipDist * 0.55) * lateral * depth

  let jawW = 0
  if (y < lipCenterY) {
    const t = (lipCenterY - y) / Math.max(1e-6, lipCenterY - chinY)
    jawW = Math.max(0, 1 - t * 0.85) * Math.exp(-nx * nx * 1.2) * Math.exp(-nz * nz * 4)
  }

  const w = Math.max(lipW, jawW * 0.7)
  if (w < 0.035) continue

  maxW = Math.max(maxW, w)
  const isUpper = y >= lipCenterY
  if (isUpper) upperN++
  else lowerN++

  let dy = 0
  let dz = 0
  if (isUpper) {
    dy = lipOpen * lipW * 0.9
    dz = backPush * lipW * 0.3
  } else {
    dy = -lipOpen * lipW - jawDrop * jawW
    dz = backPush * (lipW * 0.75 + jawW * 0.45)
  }

  deltas[i * 3] = 0
  deltas[i * 3 + 1] = dy
  deltas[i * 3 + 2] = dz
  affected++
}

const summary = {
  mesh: faceMesh.getName(),
  verts: n,
  aabb: { min, max, size },
  lipCenterY,
  lipOpen,
  jawDrop,
  affected,
  upperN,
  lowerN,
  maxW: +maxW.toFixed(3),
  dry
}
console.log(JSON.stringify(summary, null, 2))

if (dry) process.exit(0)
if (affected < 40) {
  console.error('Too few verts affected — aborting.')
  process.exit(1)
}

if (!existsSync(BAK)) {
  copyFileSync(SRC, BAK)
  console.log('Backup:', BAK)
} else {
  console.log('Backup exists — restoring SRC from backup before bake')
  copyFileSync(BAK, SRC)
}

// Re-read from backup so we never stack morphs
const doc2 = await io.read(existsSync(BAK) ? BAK : SRC)
const face2 = doc2.getRoot().listMeshes().find(meshLooksFace)
const prim2 = face2.listPrimitives()[0]
for (const t of [...prim2.listTargets()]) prim2.removeTarget(t)

const target = doc2.createPrimitiveTarget('mouthOpen')
const deltaAttr = doc2
  .createAccessor('mouthOpen_POSITION')
  .setType('VEC3')
  .setArray(deltas)
target.setAttribute('POSITION', deltaAttr)
prim2.addTarget(target)
prim2.setExtras({ ...(prim2.getExtras() || {}), targetNames: ['mouthOpen'] })
face2.setExtras({ ...(face2.getExtras() || {}), targetNames: ['mouthOpen'] })
face2.setWeights([0])

await io.write(OUT, doc2)
console.log('Wrote', OUT, 'mouthOpen morph —', affected, 'verts')
