# Cortana arm pose notes

How we keep the Sketchfab Mixamo GLB (`public/models/auntie-dot.glb`) from looking like a T-rex or a salute. Runtime lives in `components/AuntieDotAvatar.tsx`.

## What the file actually contains

| Fact | Detail |
|------|--------|
| Skeleton | Mixamo (`mixamorigLeftArm_09`, `mixamorigRightArm_033`, …) |
| Embedded clip | **`Twerking`** (~15.2s) — GLTF default scene often leaves a posed frame |
| Export pose | Asymmetric: one forearm/hand up (the “arm in the air” bug) |
| Bind after `skeleton.pose()` | Both upper arms already point **down-out** (~world dir `y ≈ -0.79`) — soft A-pose, not T-pose |

So: **reset to bind, then barely touch the arms.** Do not add a large “hang from T-pose” offset on this asset.

## Required runtime order

1. `SkeletonUtils.clone(scene)` — never `scene.clone()` (breaks skin ↔ skeleton).
2. For each `SkinnedMesh`: `skeleton.pose()` then `skeleton.update()`.
3. **Then** capture rest quaternions for idle (`buildIdleRig`).
4. Idle `applyBone` = rest × tiny euler drift only.

If you skip (2) before (3), rest quats lock in the twerk/salute frame forever.

## Axis trials (local XYZ on `LeftArm` / `RightArm`)

Offsets are **relative to rest** via `rest.multiply(quatFromEuler(x,y,z))`.

| Trial | Offset | Result |
|-------|--------|--------|
| A | No `pose()`, idle on export rest | One arm stuck up / across chest |
| B | `pose()` + large **local Z** hang (~±1.2) | Arms swing **forward** (T-rex) |
| C | `pose()` + large **local X** hang (`armDown ≈ 1.35`) | Arms shoot **backwards** (overshoot) |
| D | `pose()` + **~0** local hang, tiny idle drift | Bind A-pose: arms down-out, still wide / a bit back |
| E | `pose()` + **world-space aim** (`aimBoneWorld` → mostly `-Y`) | **Current** — axis-agnostic side hang |

### Current approach (trial E)

Do **not** guess local Euler axes for this file. After `pose()` + rest capture:

1. `aimBoneWorld(arm, targetDir)` — rotate each upper arm so the bone→child vector matches a world direction.
2. Targets used now: left `(-0.22, -1, -0.12)`, right `(0.22, -1, -0.12)`.
3. Bake the result into `handle.rest`, then idle only adds tiny drift.
4. Leave forearm rest at bind — extra local elbow bend folded the hands together in front.

World axis cheat sheet (this export faces **-Z**; camera sits on **-Z** looking at her face):

| World | Visual |
|-------|--------|
| **-Y** | Down (what we want for hang) |
| **+Y** | Up |
| **-Z** | Toward camera / in front of her (T-rex risk if too strong) |
| **+Z** | Behind her back |
| **±X** | Out from hips (left negative, right positive) |

Tune by changing the target vectors (not local XYZ):

| If arms look… | Nudge target |
|---------------|--------------|
| Too far from body (wide A) | Shrink \|X\| (e.g. `0.22` → `0.14`) |
| Through / in front of torso | Grow \|X\| slightly |
| Forward (T-rex) | **Z** too negative → move Z toward `0` or slightly positive |
| Backward | **Z** too positive → move Z more negative (toward camera) |
| Hands clasped in front | You added local forearm bend — remove it (bind forearms are fine) |
| Still up | Target Y must stay strongly negative (`-1`); re-check `pose()` ran |

Debug framing: open `?menu=1&armdebug=1` to pull the camera back and see full arms.

Rule of thumb for this GLB:

- Arms too high / salute → ensure `pose()` before rest capture; do **not** invent a big local hang first.
- Arms forward → trial B territory (local Z hang) or world target with too much +Z.
- Arms backward → trial C (local X ≈ 1.35) or world target with too much −Z / overshoot. Opposite = less of that axis, not more.
- Prefer world aim (E) over local Euler when replacing the GLB.

Shoulders / forearms in the idle loop: keep amplitudes tiny (`~0.01–0.02`). Large shoulder Z also reads as T-rex.

## Quick inspect (Node + three)

From repo root (textures may warn; bones still load):

```bash
node --input-type=module -e "
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
globalThis.self = globalThis;
globalThis.Image = class { set src(v){ this.onload&&setTimeout(()=>this.onload(),0);} };
const buf = fs.readFileSync('public/models/auntie-dot.glb');
const gltf = await new Promise((res,rej)=>new GLTFLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'',res,rej));
gltf.scene.traverse(o=>{ if(o.isSkinnedMesh&&o.skeleton){ o.skeleton.pose(); o.skeleton.update(); }});
gltf.scene.updateWorldMatrix(true,true);
gltf.scene.traverse(b=>{
  if(!b.isBone || !/Arm|ForeArm|Shoulder|Hand/i.test(b.name) || /End|Thumb|Index|Middle|Ring|Pinky/i.test(b.name)) return;
  const e=new THREE.Euler().setFromQuaternion(b.quaternion,'XYZ');
  const wp=new THREE.Vector3(); b.getWorldPosition(wp);
  const child=b.children.find(c=>c.isBone);
  let dir=null;
  if(child){ const c=new THREE.Vector3(); child.getWorldPosition(c); dir=c.sub(wp).normalize().toArray().map(n=>+n.toFixed(3)); }
  console.log(b.name, 'e', [e.x,e.y,e.z].map(n=>+n.toFixed(3)), 'dir', dir);
});
"
```

After `pose()`, expect upper-arm `dir` with a strong **negative Y**. If Y is positive, that bone is aiming up.

## Camera note

Bust framing is bone-based (`fitBustCamera`). With arms correctly down they mostly leave the crop; that is expected. Judge hang on a temporary wider FOV/dist if debugging limbs. Signature gestures raise the **right** arm into the bust frame on purpose.

## Gestures (signature clips)

Hardcoded procedural clips in `AuntieDotAvatar.tsx` — no Mixamo clip dependency (the GLB’s only clip is `Twerking`). Export: `AUNTIE_DOT_GESTURES` / `isAuntieDotGesture`.

### Sanity rules (do not break these)

| Cap | Limit (rad) | Why |
|-----|-------------|-----|
| hips | 0.08 | Stops hip pops |
| spine* | 0.16 | No corkscrews |
| neck / head | 0.28 / 0.34 | No radar head |
| shoulder | 0.42 | No T-rex shrug |
| upper arm | 0.65 | Keeps limbs in frame |
| forearm | 1.25 | Elbow bend only |
| hand | 0.48 | No claw spasms |
| bobY | 0.018 | No jumping |
| wave flap | 4 cycles max | Not a seizure |
| scan yaw | gentle sin×2 | Glance, not turret |

Every pose goes through `clampBodyPose` before apply. Prefer adding a new clip with **small** numbers; let the clamp catch mistakes.

### Library

| Name | ~s | Intent |
|------|----|--------|
| `wave` | 2.35 | Greeting — weight shift + arm flap |
| `salute` | 2.05 | Formal acknowledge |
| `nod` | 1.2 | Yes — full upper body |
| `shake_head` | 1.35 | Soft no |
| `shrug` | 1.6 | Uncertainty |
| `think` | 2.4 | Hand toward chin, head tilt |
| `present` | 2.1 | Both hands open toward user |
| `point` | 1.7 | Indicate toward camera/UI |
| `acknowledge` | 1.45 | Small bow |
| `welcome` | 2.2 | Open arms (restrained) |
| `affirm` | 1.5 | Nod + small hand |
| `listen` | 1.9 | Lean in |
| `confused` | 1.8 | Head tilt + half shrug |
| `scan` | 2.5 | Slow look L/R |
| `settle` | 1.7 | Deeper breath reset |
| `clap` | 1.55 | Two soft claps |
| `dismiss` | 1.65 | Gentle wipe-away |
| `cheer` | 1.8 | Tiny celebration (no jump) |
| `offer` | 2.0 | One-hand present |
| `glance` | 1.9 | Quick aside look |

Pipeline each frame:

1. `sampleGestureBody` → linked offsets for every major bone.
2. `clampBodyPose` enforces caps.
3. Idle fades (`idleFade`) while `env` rises.
4. Optional mild world-aim on right arm for `wave` / `salute` / `point` / `think` / `dismiss` / `cheer`.
5. Envelope = ease in → hold → ease out.

Triggers:

- Open → `wave`
- Idle auto ~9–18s → weighted pool (subtle beats more often)
- Thinking auto → `think` / `scan` / `confused` / `settle` / `glance`
- Listening auto → `listen` / `nod` / `affirm` / `settle` / `glance`
- After speaking (~45%) → `nod` / `affirm` / `acknowledge` / `present` / `offer` / `salute`
- Debug: `?gesture=<name>` + optional `?armdebug=1`

Do **not** bake gesture aims into `rest`.

## Face dynamics (look-at + mouth)

Runtime in `AuntieDotAvatar.tsx`:

| Feature | How |
|---------|-----|
| Look-at | Pointer NDC → damped neck/head yaw/pitch (fades under gestures) |
| Mouth | `talkOpen` → face mesh morph `mouthOpen` (+ TTS `onBoundary` kicks) |
| Morph bake | `node scripts/bake-mouth-open.mjs` writes relative lip-part deltas into the GLB |

Debug / POC:
- **`npm run cortana:talk-poc`** — one-command talk animation POC (starts dev if needed, opens browser)
- `?talkpoc=1` — same mode via URL: auto-opens Cortana, looping jaw + speak glow, cycling demo lines
- `?talktest=1` — looping jaw only (no auto-open)
- `?facedebug=1` — auto look figure-8 + jaw (skips idle auto-gestures) for AFK screenshots

### Mouth cavity cut + `mouthOpen`

The Sketchfab Mixamo export had sealed lips (no cavity). Overlay fakes were removed.

**Pipeline:** `npm run cortana:cut-mouth`
1. Blender (`scripts/blender-mouth-cavity.py`) deletes the lip-seal faces, extrudes a dark `cortanaMouthCavity` pocket, authors `mouthOpen`.
2. `scripts/finalize-mouth-cut.mjs` writes `public/models/auntie-dot.glb` (keep Blender’s Sketchfab axis quat — restoring the pre-mouth quat faces her away).
3. Runtime: `model.rotation.y = Math.PI` corrects Blender round-trip facing; drives `mouthOpen` on face + cavity skinned meshes.

Backup: `auntie-dot.pre-mouth.glb`. Intermediate: `auntie-dot.mouth-cut.glb` / `.blend`.

Blender 4.5 LTS: `C:\Program Files\Blender Foundation\Blender 4.5\blender.exe`.

## If the GLB is replaced

Re-run the inspect script. If the new bind is true T-pose (arm `dir` ≈ ±X, `y ≈ 0`), then a modest hang **is** needed — start with small **Z** (±0.3…0.6), not 1.35 X. Update the trial table when you learn the new axes. Re-check gesture world dirs afterward. Re-check face morphs / look-at after any new export.
