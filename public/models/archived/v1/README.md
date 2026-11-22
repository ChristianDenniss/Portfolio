# Archived Cortana / Auntie Dot models — v1

Preserved before the Garry's Mod Source-engine Cortana3DrigV2 facial-rigged asset became the runtime default.

## Contents
- `auntie-dot.glb` — Sketchfab Halo 4 Cortana at archive time (mouth cavity cut + mouthOpen morph)
- `cortana-halo4.glb` — candidate import
- `cortana-halo4-pbr.glb` — PBR candidate (same mesh lineage as auntie-dot at archive time)

## Origin (v1)
Sketchfab: Characters>Halo 4>Cortana by Bornstellar Makes Eternallasting — CC BY-NC 4.0
https://skfb.ly/oNRWK

## Runtime today
- **Default:** GMod bake at `public/models/auntie-dot.glb` (no query param)
- **Force this archive:** `/?cortana=v1` or `/?cortana=sketchfab`
- **Candidate staging GLB:** `/?cortana=gmod` → `public/models/candidates/cortana-gmod-rig-v2.glb`
- Source copy: `assets/cortana3d-rig-v2`
- Re-import: `npm run cortana:import-gmod`
- Bake mouth onto active GLB: `npm run cortana:bake-gmod-mouth`

Archived: 2026-11-16
