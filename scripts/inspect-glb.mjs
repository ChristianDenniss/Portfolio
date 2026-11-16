import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const path = resolve('public/models/candidates/cortana-halo4.glb')
const buf = readFileSync(path)

const magic = buf.toString('utf8', 0, 4)
if (magic !== 'glTF') {
  console.error('Not a GLB:', magic)
  process.exit(1)
}

const jsonLength = buf.readUInt32LE(12)
const jsonChunk = buf.subarray(20, 20 + jsonLength)
const gltf = JSON.parse(jsonChunk.toString('utf8'))

const animations = (gltf.animations || []).map((a, i) => ({
  index: i,
  name: a.name || `(unnamed ${i})`,
  channels: (a.channels || []).length,
  samplers: (a.samplers || []).length
}))

const morphMeshes = (gltf.meshes || [])
  .map((m, i) => {
    const targets = (m.primitives || []).flatMap((p) => p.targets || [])
    const weights = m.weights || []
    const extras = m.extras?.targetNames || m.primitives?.[0]?.extras?.targetNames
    return {
      index: i,
      name: m.name || `(mesh ${i})`,
      morphTargetCount: targets.length || weights.length,
      targetNames: extras || null
    }
  })
  .filter((m) => m.morphTargetCount > 0)

const skins = (gltf.skins || []).map((s, i) => ({
  index: i,
  name: s.name || `(skin ${i})`,
  joints: (s.joints || []).length
}))

const materials = (gltf.materials || []).map((m) => m.name || '(unnamed)')
const nodes = (gltf.nodes || []).map((n) => n.name).filter(Boolean)

console.log(
  JSON.stringify(
    {
      fileMB: Number((buf.length / (1024 * 1024)).toFixed(2)),
      generator: gltf.asset?.generator,
      version: gltf.asset?.version,
      extensionsUsed: gltf.extensionsUsed || [],
      animationCount: animations.length,
      animations,
      skinCount: skins.length,
      skins,
      morphMeshes,
      materialCount: materials.length,
      materials: materials.slice(0, 30),
      nodeCount: nodes.length,
      nodeSamples: nodes.slice(0, 50)
    },
    null,
    2
  )
)
