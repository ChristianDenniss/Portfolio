/**
 * Promote Blender mouth-cut GLB to production.
 * Keep Blender's Sketchfab/Twerking axis conversion (restoring the pre-mouth
 * quats double-applies the FBX→glTF flip and faces her away from camera).
 *
 * Usage: node scripts/finalize-mouth-cut.mjs
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { KHRMaterialsPBRSpecularGlossiness } from '@gltf-transform/extensions'

const ROOT = resolve('public/models')
const CUT = resolve(ROOT, 'auntie-dot.mouth-cut.glb')
const OUT = resolve(ROOT, 'auntie-dot.glb')

if (!existsSync(CUT)) {
  console.error('Missing', CUT)
  process.exit(1)
}

const io = new NodeIO().registerExtensions([KHRMaterialsPBRSpecularGlossiness])
const cut = await io.read(CUT)

for (const mesh of cut.getRoot().listMeshes()) {
  const name = (mesh.getName() || '').toLowerCase()
  const mats = mesh
    .listPrimitives()
    .map((p) => p.getMaterial()?.getName() || '')
    .join(' ')
    .toLowerCase()
  if (!name.includes('face') && !mats.includes('face') && !mats.includes('cavity')) continue
  for (const prim of mesh.listPrimitives()) {
    if (prim.listTargets().length === 0) continue
    prim.setExtras({ ...(prim.getExtras() || {}), targetNames: ['mouthOpen'] })
  }
  if (mesh.listPrimitives().some((p) => p.listTargets().length > 0)) {
    mesh.setExtras({ ...(mesh.getExtras() || {}), targetNames: ['mouthOpen'] })
    const weights = mesh.getWeights()
    if (!weights || weights.length === 0) mesh.setWeights([0])
  }
}

const sketch = cut.getRoot().listNodes().find((n) => n.getName() === 'Sketchfab_model')
const twerk = cut.getRoot().listNodes().find((n) => n.getName() === 'Twerking.fbx')

await io.write(OUT, cut)
copyFileSync(CUT, resolve(ROOT, 'auntie-dot.mouth-cut.raw.glb'))

console.log(
  JSON.stringify(
    {
      out: OUT,
      sketchfabRotation: sketch?.getRotation() ?? null,
      twerkingScale: twerk?.getScale() ?? null,
      face: cut
        .getRoot()
        .listMeshes()
        .filter((m) => (m.getName() || '').toLowerCase().includes('face'))
        .map((m) => ({
          name: m.getName(),
          prims: m.listPrimitives().length,
          targets: m.listPrimitives().map((p) => p.listTargets().length),
          extras: m.getExtras()
        }))
    },
    null,
    2
  )
)
