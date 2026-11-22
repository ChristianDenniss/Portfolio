# Cortana3DrigV2 (Garry's Mod / Source)

Local copy of the free GMod workshop Cortana player model used for facial-rig import.

- Source MDL: `models/cortana/cortana.mdl`
- Materials: `materials/models/cortana/*`
- Pipeline: `npm run cortana:import-gmod` → `public/models/candidates/cortana-gmod-rig-v2.glb` (local staging; gitignored)
- Bake into runtime: `npm run cortana:bake-gmod-mouth` → updates `public/models/auntie-dot.glb` (what ships)
- Preview (production default): `/?menu=1&talkpoc=1` or `npm run cortana:talk-poc`
- Preview local candidate before/without bake: `/?menu=1&talkpoc=1&cortana=gmod`

**Runtime default** is the GMod bake at `public/models/auntie-dot.glb`. Sketchfab v1 stays archived at `public/models/archived/v1/` — force with `?cortana=v1`.
