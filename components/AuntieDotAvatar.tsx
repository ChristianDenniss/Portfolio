'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import type {
  Bone,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  SkinnedMesh
} from 'three'
import {
  Box3,
  Color,
  DoubleSide,
  Euler,
  Group,
  MathUtils,
  Quaternion,
  Vector3
} from 'three'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

export type AuntieDotAvatarMode = 'idle' | 'listening' | 'thinking' | 'speaking'

/**
 * Hardcoded signature clips — see docs/auntie-dot-arm-pose.md § Gestures.
 * Keep additions restrained; `clampBodyPose` enforces amplitude caps.
 */
export type AuntieDotGesture =
  | 'wave'
  | 'salute'
  | 'nod'
  | 'shake_head'
  | 'shrug'
  | 'think'
  | 'present'
  | 'point'
  | 'acknowledge'
  | 'welcome'
  | 'affirm'
  | 'listen'
  | 'confused'
  | 'scan'
  | 'settle'
  | 'clap'
  | 'dismiss'
  | 'cheer'
  | 'offer'
  | 'glance'

export const AUNTIE_DOT_GESTURES: readonly AuntieDotGesture[] = [
  'wave',
  'salute',
  'nod',
  'shake_head',
  'shrug',
  'think',
  'present',
  'point',
  'acknowledge',
  'welcome',
  'affirm',
  'listen',
  'confused',
  'scan',
  'settle',
  'clap',
  'dismiss',
  'cheer',
  'offer',
  'glance'
] as const

export function isAuntieDotGesture(value: string): value is AuntieDotGesture {
  return (AUNTIE_DOT_GESTURES as readonly string[]).includes(value)
}

/**
 * Default: GMod Cortana3DrigV2 with baked mouthOpen + facial bones.
 * Sketchfab v1 archived at public/models/archived/v1/ — force with ?cortana=v1
 */
export const AUNTIE_DOT_MODEL_SRC = '/models/auntie-dot.glb?v=gmodMouth2'
export const AUNTIE_DOT_MODEL_SRC_V1 = '/models/archived/v1/auntie-dot.glb?v=1'
export const AUNTIE_DOT_MODEL_SRC_GMOD = '/models/candidates/cortana-gmod-rig-v2.glb?v=mouthBake2'

export function resolveAuntieDotModelSrc(search = ''): string {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const tag = q.get('cortana') || q.get('model')
  if (tag === 'v1' || tag === 'sketchfab') return AUNTIE_DOT_MODEL_SRC_V1
  if (tag === 'gmod' || tag === 'candidate') return AUNTIE_DOT_MODEL_SRC_GMOD
  return AUNTIE_DOT_MODEL_SRC
}

const GESTURE_DURATION: Record<AuntieDotGesture, number> = {
  wave: 2.35,
  salute: 2.05,
  nod: 1.2,
  shake_head: 1.35,
  shrug: 1.6,
  think: 2.4,
  present: 2.1,
  point: 1.7,
  acknowledge: 1.45,
  welcome: 2.2,
  affirm: 1.5,
  listen: 1.9,
  confused: 1.8,
  scan: 2.5,
  settle: 1.7,
  clap: 1.55,
  dismiss: 1.65,
  cheer: 1.8,
  offer: 2.0,
  glance: 1.9
}

/** Gestures that raise an arm into the bust frame via world-aim assist. */
const ARM_AIM_GESTURE: Partial<Record<AuntieDotGesture, 'wave' | 'salute' | 'point' | 'think'>> = {
  wave: 'wave',
  salute: 'salute',
  point: 'point',
  think: 'think',
  dismiss: 'wave',
  cheer: 'wave'
}

const IDLE_GESTURE_MIN_S = 9
const IDLE_GESTURE_MAX_S = 18
/** Weighted toward subtle beats; big salutes/waves less often. */
const IDLE_GESTURE_POOL: AuntieDotGesture[] = [
  'settle',
  'settle',
  'nod',
  'nod',
  'glance',
  'glance',
  'shake_head',
  'shrug',
  'affirm',
  'acknowledge',
  'scan',
  'confused',
  'think',
  'offer',
  'present',
  'wave',
  'point',
  'dismiss',
  'clap',
  'welcome',
  'cheer',
  'salute'
]

/** Hard caps (radians) — anything above looks broken on this bust crop. */
const POSE_LIMITS = {
  hips: 0.08,
  spine: 0.16,
  neck: 0.28,
  head: 0.34,
  shoulder: 0.42,
  arm: 0.65,
  foreArm: 1.25,
  hand: 0.48,
  bobY: 0.018
} as const

type BoneHandle = {
  node: Bone | Object3D
  rest: Quaternion
}

type IdleRig = {
  /** Source / GMod ValveBiped — local look axes differ from Mixamo. */
  valve: boolean
  hips?: BoneHandle
  spine?: BoneHandle
  spine1?: BoneHandle
  spine2?: BoneHandle
  neck?: BoneHandle
  head?: BoneHandle
  leftShoulder?: BoneHandle
  rightShoulder?: BoneHandle
  leftArm?: BoneHandle
  rightArm?: BoneHandle
  leftForeArm?: BoneHandle
  rightForeArm?: BoneHandle
  leftHand?: BoneHandle
  rightHand?: BoneHandle
}

const _euler = new Euler()
const _quat = new Quaternion()
const _qAim = new Quaternion()
const _v0 = new Vector3()
const _v1 = new Vector3()
const _qWorld = new Quaternion()
const _qParent = new Quaternion()
const _qDelta = new Quaternion()
// World aim peaks (model faces -Z). Kept moderate so limbs stay readable, not spasmodic.
const _waveDir = new Vector3(0.55, 0.95, -0.75)
const _saluteDir = new Vector3(0.18, 1.0, -0.65)
const _pointDir = new Vector3(0.35, 0.55, -0.9)
const _thinkDir = new Vector3(0.25, 0.7, -0.55)
const _lookDir = new Vector3()
const _qIdle = new Quaternion()
/** Soft look-at limits (local rad) — keep bust framing / neck skinning stable. */
const LOOK_YAW_MAX = 0.48
const LOOK_PITCH_MAX = 0.28
const LOOK_SMOOTH = 4.2
/** Ease pointer so small moves still read; |ndc|^0.72. */
const LOOK_RESPONSE = 0.72
/** Open ease on word kicks. Close snaps so pauses/rests read as closed lips. */
const JAW_OPEN_SMOOTH = 14
const JAW_CLOSE_SMOOTH = 22

/**
 * Fake speech jaw: one syllable burst then a real closed rest.
 * Old 0.08+layered-sins never returned to 0 — permanent half-open mouth.
 */
function sampleTalkJaw(t: number): number {
  // ~3.6 syllable slots / sec; open for first ~42% of each slot, closed the rest.
  const rate = 3.6
  const u = (t * rate) % 1
  const openWindow = 0.42
  if (u >= openWindow) return 0
  // Half-sine inside the window → 0 at both ends (clean lip close).
  const burst = Math.sin((u / openWindow) * Math.PI)
  // Vary amplitude like stressed vs unstressed syllables.
  const stress = 0.38 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2.3 + 0.4))
  // Phrase pause every ~1.7s — hold closed a beat.
  const phrase = Math.sin(t * 0.85)
  if (phrase < -0.65) return 0
  return MathUtils.clamp(burst * stress, 0, 0.78)
}

type MouthTarget = { mesh: SkinnedMesh; index: number; weight: number }

type FaceMouthBones = {
  jaw?: BoneHandle
  lipLower?: BoneHandle
  lipUpper?: BoneHandle
  cornerL?: BoneHandle
  cornerR?: BoneHandle
  teethLower?: BoneHandle
}

type MouthDriver = {
  /** Primary face mesh (glow / debug). */
  mesh: SkinnedMesh
  index: number
  baseEmissive?: number
  /** Weighted morph targets (FACS AU26/25 or authored mouthOpen). */
  targets: MouthTarget[]
  /** Source facial bones — primary talk path when morph deltas are empty. */
  faceBones: FaceMouthBones
}

function enableMeshMorphTargets(mesh: SkinnedMesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const mat of mats) {
    const m = mat as MeshStandardMaterial & { morphTargets?: boolean }
    if (m) {
      m.morphTargets = true
      m.needsUpdate = true
    }
  }
}

/** True if a morph attribute actually moves verts (GMod FACS slots are often near-empty). */
function morphHasDelta(mesh: SkinnedMesh, index: number, minDelta = 0.05): boolean {
  const attr = mesh.geometry.morphAttributes?.position?.[index]
  if (!attr) return false
  const arr = attr.array as ArrayLike<number>
  let max = 0
  for (let i = 0; i < arr.length; i++) {
    const a = Math.abs(arr[i]!)
    if (a > max) max = a
    if (max >= minDelta) return true
  }
  return false
}

/**
 * Weighted mouth morphs — only when deltas are large enough to see.
 * GMod SourceIO FACS/mouthOpen max deltas are ~0.01–0.04 here; jaw bones open instead.
 */
function findMouthMorphTargets(mesh: SkinnedMesh): MouthTarget[] {
  const dict = mesh.morphTargetDictionary
  if (!dict) return []

  const weighted: { key: string; weight: number }[] = [
    { key: 'mouthOpen', weight: 0.85 },
    { key: 'AU26L', weight: 1.0 },
    { key: 'AU26R', weight: 1.0 },
    { key: 'AU25L', weight: 0.7 },
    { key: 'AU25R', weight: 0.7 }
  ]
  const found: MouthTarget[] = []
  for (const { key, weight } of weighted) {
    if (!(key in dict)) continue
    const index = dict[key]!
    if (!morphHasDelta(mesh, index)) continue
    found.push({ mesh, index, weight })
  }
  return found
}

function buildFaceMouthBones(root: Object3D): FaceMouthBones {
  const bones = collectSkeletonBones(root)
  // Capture true bind rests — do NOT pre-close (that jammed the jaw into an underbite).
  return {
    jaw: pickBone(bones, (n) => n === 'headjaw' || n.endsWith('headjaw')),
    lipLower: pickBone(
      bones,
      (n) => n.includes('liplower') && (n.includes('middle') || n.includes('mid'))
    ),
    lipUpper: pickBone(
      bones,
      (n) => n.includes('lipupper') && (n.includes('middle') || n.includes('mid'))
    ),
    cornerL: pickBone(bones, (n) => n.includes('mouthcorner') && n.includes('left')),
    cornerR: pickBone(bones, (n) => n.includes('mouthcorner') && n.includes('right')),
    teethLower: pickBone(bones, (n) => n.includes('teethlower'))
  }
}

/**
 * Open mouth on +X (Blender + live gap verified for this SourceIO Cortana).
 * Always write including 0 so the jaw returns to bind rest — closed lips stay as authored.
 */
function applyTalkFaceBones(face: FaceMouthBones, amount: number) {
  // Keep speech in a natural talk range — full 1.0 is a wide drop, not a scream void.
  const a = MathUtils.clamp(amount, 0, 1)
  applyBone(face.jaw, a * 0.38, 0, 0)
  applyBone(face.teethLower, a * 0.34, 0, 0)
  applyBone(face.lipLower, a * 0.12, 0, 0)
  applyBone(face.lipUpper, -a * 0.03, 0, 0)
  applyBone(face.cornerL, 0, 0, 0)
  applyBone(face.cornerR, 0, 0, 0)
}

/**
 * Mixamo world look (face −Z). ValveBiped uses local euler yaw/pitch in useFrame —
 * setFromUnitVectors alone rolls into a shoulder lean on this SourceIO axis layout.
 */
function applyWorldLook(
  handle: BoneHandle | undefined,
  lookDir: Vector3,
  weight: number,
  faceLocal: Vector3
) {
  if (!handle || weight <= 0.001) return
  const bone = handle.node
  const parent = bone.parent
  if (!parent) return

  _qIdle.copy(bone.quaternion)

  bone.quaternion.copy(handle.rest)
  parent.updateWorldMatrix(true, false)
  bone.updateWorldMatrix(true, false)
  _v0.copy(faceLocal).transformDirection(bone.matrixWorld).normalize()
  _qDelta.setFromUnitVectors(_v0, _v1.copy(lookDir).normalize())

  bone.getWorldQuaternion(_qWorld)
  _qWorld.premultiply(_qDelta)
  parent.getWorldQuaternion(_qParent)
  _qAim.copy(_qParent).invert().multiply(_qWorld)

  bone.quaternion.copy(_qIdle).slerp(_qAim, MathUtils.clamp(weight, 0, 1))
}

/** Mixamo/glTF heads face −Z. */
const _faceLocalDefault = new Vector3(0, 0, -1)

/**
 * Drive authored mouth morphs + Source facial bones.
 * GMod re-import: `npm run cortana:import-gmod`. v1 cut: `npm run cortana:cut-mouth`.
 */
function ensureMouthOpenMorph(root: Object3D): MouthDriver | null {
  const skinned: SkinnedMesh[] = []
  root.traverse((obj) => {
    const mesh = obj as SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.geometry) skinned.push(mesh)
  })

  const targets: MouthTarget[] = []
  for (const mesh of skinned) {
    const found = findMouthMorphTargets(mesh)
    if (found.length === 0) continue
    enableMeshMorphTargets(mesh)
    targets.push(...found)
  }

  const faceBones = buildFaceMouthBones(root)
  const hasBones = Boolean(faceBones.jaw || faceBones.lipLower)
  // Facial bones win on this Source rig — tiny FACS morphs only gum / underbite.
  const useMorphs = targets.length > 0 && !hasBones
  const morphTargets = useMorphs ? targets : []
  if (morphTargets.length === 0 && !hasBones) return null

  const primaryMesh =
    skinned.find((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material]
      return mats.some((mat) => /face/i.test((mat as MeshStandardMaterial)?.name || ''))
    }) ||
    morphTargets[0]?.mesh ||
    skinned.find((m) => faceBones.jaw && m.skeleton?.bones.includes(faceBones.jaw.node as Bone)) ||
    skinned[0]
  if (!primaryMesh) return null

  const primary =
    morphTargets.find((t) => t.mesh === primaryMesh) ||
    morphTargets.find((t) => {
      const mat = Array.isArray(t.mesh.material) ? t.mesh.material[0] : t.mesh.material
      const matName = compactName((mat as MeshStandardMaterial)?.name || '')
      return matName.includes('face') || matName.includes('cortanaface')
    }) ||
    morphTargets[0]

  let baseEmissive = 0.45
  const faceMat = Array.isArray(primaryMesh.material)
    ? primaryMesh.material[0]
    : primaryMesh.material
  if (faceMat && 'emissiveIntensity' in faceMat) {
    baseEmissive = (faceMat as MeshStandardMaterial).emissiveIntensity ?? 0.45
  }

  return {
    mesh: primaryMesh,
    index: primary?.index ?? 0,
    baseEmissive,
    targets: morphTargets,
    faceBones
  }
}

function lookResponse(ndc: number, max: number) {
  const a = MathUtils.clamp(ndc, -1, 1)
  const shaped = Math.sign(a) * Math.pow(Math.abs(a), LOOK_RESPONSE)
  return MathUtils.clamp(shaped * max, -max, max)
}

function compactName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Local quaternion that aims bone→child along `worldDir` (does not write rest).
 * Axis-agnostic — preferred over guessing local X/Y/Z for this GLB.
 * See docs/auntie-dot-arm-pose.md.
 */
function computeAimLocalQuat(handle: BoneHandle, worldDir: Vector3, out: Quaternion): Quaternion | null {
  const bone = handle.node
  const parent = bone.parent
  const child = bone.children.find((c) => (c as Bone).isBone) ?? bone.children[0]
  if (!parent || !child) return null

  // Evaluate direction from the hang/rest pose so gestures are stable every frame.
  bone.quaternion.copy(handle.rest)
  bone.updateWorldMatrix(true, false)
  child.updateWorldMatrix(true, false)
  bone.getWorldPosition(_v0)
  child.getWorldPosition(_v1)
  const current = _v1.sub(_v0)
  if (current.lengthSq() < 1e-10) return null
  current.normalize()

  _qDelta.setFromUnitVectors(current, _v0.copy(worldDir).normalize())
  bone.getWorldQuaternion(_qWorld)
  _qWorld.premultiply(_qDelta)

  parent.updateWorldMatrix(true, false)
  parent.getWorldQuaternion(_qParent)
  return out.copy(_qParent.invert().multiply(_qWorld))
}

/** Aim a bone so the vector toward its first child bone matches `worldDir`, baking into rest. */
function aimBoneWorld(handle: BoneHandle | undefined, worldDir: Vector3) {
  if (!handle) return
  const q = computeAimLocalQuat(handle, worldDir, _qAim)
  if (!q) return
  handle.node.quaternion.copy(q)
  handle.rest.copy(q)
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = MathUtils.clamp((x - edge0) / Math.max(1e-6, edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Envelope: ease up, hold, ease down. peaks at 1 across the middle. */
function gestureEnvelope(u: number, attack = 0.22, release = 0.28) {
  if (u <= 0 || u >= 1) return 0
  if (u < attack) return smoothstep(0, attack, u)
  if (u > 1 - release) return 1 - smoothstep(1 - release, 1, u)
  return 1
}

function applyBoneSlerpRest(handle: BoneHandle | undefined, targetLocal: Quaternion | null, amount: number) {
  if (!handle || !targetLocal || amount <= 0) return
  handle.node.quaternion.copy(handle.rest).slerp(targetLocal, MathUtils.clamp(amount, 0, 1))
}

type Vec3 = [number, number, number]
type BodyPose = {
  hips: Vec3
  spine: Vec3
  spine1: Vec3
  spine2: Vec3
  neck: Vec3
  head: Vec3
  leftShoulder: Vec3
  rightShoulder: Vec3
  leftArm: Vec3
  rightArm: Vec3
  leftForeArm: Vec3
  rightForeArm: Vec3
  leftHand: Vec3
  rightHand: Vec3
  /** Root bob extras (y lift, slight z lean feel via group) */
  bobY: number
}

const ZERO_POSE: BodyPose = {
  hips: [0, 0, 0],
  spine: [0, 0, 0],
  spine1: [0, 0, 0],
  spine2: [0, 0, 0],
  neck: [0, 0, 0],
  head: [0, 0, 0],
  leftShoulder: [0, 0, 0],
  rightShoulder: [0, 0, 0],
  leftArm: [0, 0, 0],
  rightArm: [0, 0, 0],
  leftForeArm: [0, 0, 0],
  rightForeArm: [0, 0, 0],
  leftHand: [0, 0, 0],
  rightHand: [0, 0, 0],
  bobY: 0
}

function addPose(a: Vec3, b: Vec3, w = 1): Vec3 {
  return [a[0] + b[0] * w, a[1] + b[1] * w, a[2] + b[2] * w]
}

function clampVec(v: Vec3, lim: number): Vec3 {
  return [
    MathUtils.clamp(v[0], -lim, lim),
    MathUtils.clamp(v[1], -lim, lim),
    MathUtils.clamp(v[2], -lim, lim)
  ]
}

/** Sanity gate — keeps full-body clips from exploding into T-rex / seizure territory. */
function clampBodyPose(pose: BodyPose): BodyPose {
  return {
    hips: clampVec(pose.hips, POSE_LIMITS.hips),
    spine: clampVec(pose.spine, POSE_LIMITS.spine),
    spine1: clampVec(pose.spine1, POSE_LIMITS.spine),
    spine2: clampVec(pose.spine2, POSE_LIMITS.spine),
    neck: clampVec(pose.neck, POSE_LIMITS.neck),
    head: clampVec(pose.head, POSE_LIMITS.head),
    leftShoulder: clampVec(pose.leftShoulder, POSE_LIMITS.shoulder),
    rightShoulder: clampVec(pose.rightShoulder, POSE_LIMITS.shoulder),
    leftArm: clampVec(pose.leftArm, POSE_LIMITS.arm),
    rightArm: clampVec(pose.rightArm, POSE_LIMITS.arm),
    leftForeArm: clampVec(pose.leftForeArm, POSE_LIMITS.foreArm),
    rightForeArm: clampVec(pose.rightForeArm, POSE_LIMITS.foreArm),
    leftHand: clampVec(pose.leftHand, POSE_LIMITS.hand),
    rightHand: clampVec(pose.rightHand, POSE_LIMITS.hand),
    bobY: MathUtils.clamp(pose.bobY, -POSE_LIMITS.bobY, POSE_LIMITS.bobY)
  }
}

function pose(partial: Partial<BodyPose>): BodyPose {
  return clampBodyPose({ ...ZERO_POSE, ...partial })
}

/**
 * Full-body signature poses. `env` = raise/hold/release; `u` = raw 0..1 for pulses.
 * Always run through `clampBodyPose` before apply.
 */
function sampleGestureBody(name: AuntieDotGesture, u: number, env: number): BodyPose {
  if (env <= 0.001) return ZERO_POSE
  const e = env

  switch (name) {
    case 'wave': {
      const flap = Math.sin(u * Math.PI * 4) * e
      const sway = Math.sin(u * Math.PI * 2) * e
      return pose({
        hips: [0.035 * e, -0.05 * e + 0.015 * sway, 0.025 * e],
        spine: [0.04 * e, -0.08 * e, 0.03 * e],
        spine1: [0.05 * e, -0.1 * e, 0.04 * e],
        spine2: [0.035 * e, -0.11 * e + 0.025 * flap, 0.045 * e],
        neck: [-0.03 * e, -0.1 * e + 0.03 * flap, 0.04 * e],
        head: [-0.05 * e, -0.12 * e + 0.04 * flap, 0.03 * e],
        leftShoulder: [0.03 * e, 0.015 * e, 0.06 * e],
        rightShoulder: [-0.24 * e, 0.12 * e, -0.32 * e],
        leftArm: [0.05 * e, -0.03 * e, 0.08 * e],
        rightArm: [-0.48 * e, 0.22 * e, -0.42 * e],
        leftForeArm: [0.06 * e, 0, 0.05 * e],
        rightForeArm: [0.42 * e, 0.1 * e, -0.62 * e + 0.55 * flap],
        leftHand: [0.015 * e, 0, 0.02 * e],
        rightHand: [0.12 * e, 0.35 * flap, -0.18 * e],
        bobY: 0.01 * e + 0.003 * Math.abs(flap)
      })
    }
    case 'salute': {
      const snap = smoothstep(0.15, 0.35, u) * (1 - smoothstep(0.7, 0.92, u))
      const h = e * (0.75 + 0.25 * snap)
      return pose({
        hips: [0.025 * h, -0.04 * h, 0.015 * h],
        spine: [0.06 * h, -0.07 * h, 0.025 * h],
        spine1: [0.08 * h, -0.09 * h, 0.03 * h],
        spine2: [0.055 * h, -0.1 * h, 0.04 * h],
        neck: [-0.06 * h, -0.05 * h, 0.025 * h],
        head: [-0.08 * h, -0.04 * h, 0.015 * h],
        leftShoulder: [0.025 * h, 0, 0.05 * h],
        rightShoulder: [-0.28 * h, 0.14 * h, -0.36 * h],
        leftArm: [0.04 * h, -0.025 * h, 0.06 * h],
        rightArm: [-0.4 * h, 0.18 * h, -0.35 * h],
        leftForeArm: [0.05 * h, 0, 0.03 * h],
        rightForeArm: [0.95 * h, 0.28 * h, -1.15 * h],
        leftHand: [0.015 * h, 0, 0.015 * h],
        rightHand: [0.22 * h, 0.16 * h, -0.35 * h],
        bobY: 0.007 * h
      })
    }
    case 'nod': {
      const n = Math.sin(u * Math.PI) * gestureEnvelope(u, 0.12, 0.18)
      return pose({
        hips: [0.012 * n, 0, 0],
        spine: [0.04 * n, 0.008 * n, 0],
        spine1: [0.055 * n, 0.012 * n, 0],
        spine2: [0.05 * n, 0.01 * n, 0],
        neck: [0.16 * n, 0.015 * n, 0],
        head: [0.26 * n, 0.025 * n, 0.008 * n],
        leftShoulder: [0.015 * n, 0, 0.015 * n],
        rightShoulder: [0.015 * n, 0, -0.015 * n],
        leftArm: [0.025 * n, 0, 0.015 * n],
        rightArm: [0.025 * n, 0, -0.015 * n],
        leftForeArm: [0.03 * n, 0, 0],
        rightForeArm: [0.03 * n, 0, 0],
        bobY: -0.005 * n
      })
    }
    case 'shake_head': {
      const yaw = Math.sin(u * Math.PI * 3) * e
      return pose({
        hips: [0.008 * e, 0.01 * yaw, 0],
        spine: [0.015 * e, 0.04 * yaw, 0],
        spine1: [0.02 * e, 0.05 * yaw, 0],
        spine2: [0.018 * e, 0.06 * yaw, 0],
        neck: [0.02 * e, 0.16 * yaw, 0.02 * e],
        head: [0.03 * e, 0.22 * yaw, 0.025 * e],
        leftShoulder: [0.01 * e, 0, 0.02 * e],
        rightShoulder: [0.01 * e, 0, -0.02 * e],
        leftArm: [0.02 * e, 0, 0.02 * e],
        rightArm: [0.02 * e, 0, -0.02 * e],
        bobY: 0
      })
    }
    case 'shrug': {
      const lift = e * (0.85 + 0.15 * Math.sin(u * Math.PI))
      return pose({
        hips: [0.01 * lift, 0, 0],
        spine: [0.03 * lift, 0, 0.02 * lift],
        spine1: [0.04 * lift, 0, 0.025 * lift],
        spine2: [0.035 * lift, 0, 0.03 * lift],
        neck: [0.04 * lift, 0, 0],
        head: [0.05 * lift, 0.02 * lift, 0],
        leftShoulder: [-0.2 * lift, 0.06 * lift, 0.22 * lift],
        rightShoulder: [-0.2 * lift, -0.06 * lift, -0.22 * lift],
        leftArm: [-0.12 * lift, 0.08 * lift, 0.18 * lift],
        rightArm: [-0.12 * lift, -0.08 * lift, -0.18 * lift],
        leftForeArm: [0.25 * lift, 0.1 * lift, 0.35 * lift],
        rightForeArm: [0.25 * lift, -0.1 * lift, -0.35 * lift],
        leftHand: [0.08 * lift, 0.05 * lift, 0.1 * lift],
        rightHand: [0.08 * lift, -0.05 * lift, -0.1 * lift],
        bobY: 0.006 * lift
      })
    }
    case 'think': {
      const h = e
      return pose({
        hips: [0.02 * h, 0.03 * h, 0.015 * h],
        spine: [0.04 * h, 0.06 * h, 0.02 * h],
        spine1: [0.05 * h, 0.07 * h, 0.025 * h],
        spine2: [0.04 * h, 0.08 * h, 0.03 * h],
        neck: [0.05 * h, 0.1 * h, -0.04 * h],
        head: [0.06 * h, 0.12 * h, -0.05 * h],
        leftShoulder: [0.02 * h, 0, 0.04 * h],
        rightShoulder: [-0.18 * h, 0.1 * h, -0.22 * h],
        leftArm: [0.03 * h, -0.02 * h, 0.05 * h],
        rightArm: [-0.35 * h, 0.2 * h, -0.28 * h],
        leftForeArm: [0.04 * h, 0, 0.03 * h],
        rightForeArm: [0.85 * h, 0.25 * h, -0.7 * h],
        leftHand: [0.01 * h, 0, 0.01 * h],
        rightHand: [0.15 * h, 0.12 * h, -0.2 * h],
        bobY: 0.004 * h
      })
    }
    case 'present': {
      return pose({
        hips: [0.02 * e, 0, 0.02 * e],
        spine: [-0.03 * e, 0, 0],
        spine1: [-0.04 * e, 0, 0],
        spine2: [-0.03 * e, 0, 0],
        neck: [-0.04 * e, 0, 0],
        head: [-0.05 * e, 0, 0],
        leftShoulder: [-0.12 * e, 0.05 * e, 0.14 * e],
        rightShoulder: [-0.12 * e, -0.05 * e, -0.14 * e],
        leftArm: [-0.28 * e, 0.12 * e, 0.22 * e],
        rightArm: [-0.28 * e, -0.12 * e, -0.22 * e],
        leftForeArm: [0.35 * e, 0.08 * e, 0.4 * e],
        rightForeArm: [0.35 * e, -0.08 * e, -0.4 * e],
        leftHand: [0.1 * e, 0.06 * e, 0.12 * e],
        rightHand: [0.1 * e, -0.06 * e, -0.12 * e],
        bobY: 0.008 * e
      })
    }
    case 'point': {
      return pose({
        hips: [0.02 * e, -0.03 * e, 0.02 * e],
        spine: [0.03 * e, -0.05 * e, 0.025 * e],
        spine1: [0.04 * e, -0.06 * e, 0.03 * e],
        spine2: [0.035 * e, -0.07 * e, 0.035 * e],
        neck: [-0.02 * e, -0.06 * e, 0.02 * e],
        head: [-0.03 * e, -0.07 * e, 0.02 * e],
        leftShoulder: [0.02 * e, 0, 0.04 * e],
        rightShoulder: [-0.2 * e, 0.08 * e, -0.24 * e],
        leftArm: [0.03 * e, -0.02 * e, 0.05 * e],
        rightArm: [-0.4 * e, 0.1 * e, -0.45 * e],
        leftForeArm: [0.04 * e, 0, 0.03 * e],
        rightForeArm: [0.15 * e, 0.05 * e, -0.25 * e],
        leftHand: [0.01 * e, 0, 0.01 * e],
        rightHand: [0.05 * e, 0.04 * e, -0.15 * e],
        bobY: 0.005 * e
      })
    }
    case 'acknowledge': {
      const bow = Math.sin(u * Math.PI) * e
      return pose({
        hips: [0.03 * bow, 0, 0],
        spine: [0.08 * bow, 0.01 * bow, 0],
        spine1: [0.1 * bow, 0.012 * bow, 0],
        spine2: [0.09 * bow, 0.01 * bow, 0],
        neck: [0.12 * bow, 0.015 * bow, 0],
        head: [0.16 * bow, 0.02 * bow, 0],
        leftShoulder: [0.02 * bow, 0, 0.03 * bow],
        rightShoulder: [0.02 * bow, 0, -0.03 * bow],
        leftArm: [0.04 * bow, 0, 0.03 * bow],
        rightArm: [0.04 * bow, 0, -0.03 * bow],
        bobY: -0.008 * bow
      })
    }
    case 'welcome': {
      return pose({
        hips: [0.015 * e, 0, 0.015 * e],
        spine: [-0.025 * e, 0, 0],
        spine1: [-0.03 * e, 0, 0],
        spine2: [-0.025 * e, 0, 0],
        neck: [-0.03 * e, 0, 0],
        head: [-0.04 * e, 0, 0],
        leftShoulder: [-0.1 * e, 0.04 * e, 0.16 * e],
        rightShoulder: [-0.1 * e, -0.04 * e, -0.16 * e],
        leftArm: [-0.22 * e, 0.1 * e, 0.28 * e],
        rightArm: [-0.22 * e, -0.1 * e, -0.28 * e],
        leftForeArm: [0.2 * e, 0.06 * e, 0.25 * e],
        rightForeArm: [0.2 * e, -0.06 * e, -0.25 * e],
        leftHand: [0.06 * e, 0.04 * e, 0.08 * e],
        rightHand: [0.06 * e, -0.04 * e, -0.08 * e],
        bobY: 0.007 * e
      })
    }
    case 'affirm': {
      const n = Math.sin(u * Math.PI) * e
      return pose({
        hips: [0.01 * n, 0, 0],
        spine: [0.035 * n, 0.01 * n, 0],
        spine1: [0.045 * n, 0.012 * n, 0],
        spine2: [0.04 * n, 0.01 * n, 0],
        neck: [0.12 * n, 0.02 * n, 0],
        head: [0.2 * n, 0.025 * n, 0],
        leftShoulder: [0.01 * n, 0, 0.02 * n],
        rightShoulder: [-0.08 * n, 0.04 * n, -0.1 * n],
        leftArm: [0.02 * n, 0, 0.02 * n],
        rightArm: [-0.12 * n, 0.06 * n, -0.12 * n],
        rightForeArm: [0.2 * n, 0.05 * n, -0.15 * n],
        rightHand: [0.06 * n, 0.04 * n, -0.08 * n],
        bobY: -0.004 * n
      })
    }
    case 'listen': {
      return pose({
        hips: [0.02 * e, 0.02 * e, 0],
        spine: [0.06 * e, 0.04 * e, 0],
        spine1: [0.07 * e, 0.05 * e, 0],
        spine2: [0.06 * e, 0.045 * e, 0],
        neck: [0.05 * e, 0.06 * e, 0.02 * e],
        head: [0.04 * e, 0.07 * e, 0.025 * e],
        leftShoulder: [0.02 * e, 0, 0.03 * e],
        rightShoulder: [0.02 * e, 0, -0.03 * e],
        leftArm: [0.03 * e, 0, 0.04 * e],
        rightArm: [0.03 * e, 0, -0.04 * e],
        bobY: 0.003 * e
      })
    }
    case 'confused': {
      const tilt = e * (0.7 + 0.3 * Math.sin(u * Math.PI))
      return pose({
        hips: [0.01 * tilt, 0.02 * tilt, 0],
        spine: [0.02 * tilt, 0.03 * tilt, 0.04 * tilt],
        spine1: [0.025 * tilt, 0.035 * tilt, 0.05 * tilt],
        spine2: [0.02 * tilt, 0.04 * tilt, 0.055 * tilt],
        neck: [0.03 * tilt, 0.05 * tilt, 0.12 * tilt],
        head: [0.04 * tilt, 0.06 * tilt, 0.16 * tilt],
        leftShoulder: [-0.1 * tilt, 0.03 * tilt, 0.12 * tilt],
        rightShoulder: [-0.08 * tilt, -0.02 * tilt, -0.08 * tilt],
        leftArm: [-0.08 * tilt, 0.05 * tilt, 0.12 * tilt],
        rightArm: [0.03 * tilt, -0.02 * tilt, -0.04 * tilt],
        leftForeArm: [0.15 * tilt, 0.05 * tilt, 0.2 * tilt],
        bobY: 0.002 * tilt
      })
    }
    case 'scan': {
      // Slow glance only — never a full radar sweep
      const yaw = Math.sin(u * Math.PI * 2) * e
      return pose({
        hips: [0.008 * e, 0.015 * yaw, 0],
        spine: [0.015 * e, 0.04 * yaw, 0],
        spine1: [0.02 * e, 0.05 * yaw, 0],
        spine2: [0.018 * e, 0.055 * yaw, 0],
        neck: [0.01 * e, 0.14 * yaw, 0],
        head: [0.015 * e, 0.18 * yaw, 0.01 * e],
        leftShoulder: [0.01 * e, 0, 0.015 * e],
        rightShoulder: [0.01 * e, 0, -0.015 * e],
        leftArm: [0.015 * e, 0, 0.015 * e],
        rightArm: [0.015 * e, 0, -0.015 * e],
        bobY: 0
      })
    }
    case 'settle': {
      const breath = Math.sin(u * Math.PI) * e
      return pose({
        hips: [0.02 * breath, 0, 0],
        spine: [0.05 * breath, 0.01 * breath, 0],
        spine1: [0.06 * breath, 0.012 * breath, 0],
        spine2: [0.055 * breath, 0.01 * breath, 0],
        neck: [0.03 * breath, 0, 0],
        head: [0.025 * breath, 0, 0],
        leftShoulder: [0.02 * breath, 0, 0.025 * breath],
        rightShoulder: [0.02 * breath, 0, -0.025 * breath],
        leftArm: [0.03 * breath, 0, 0.03 * breath],
        rightArm: [0.03 * breath, 0, -0.03 * breath],
        bobY: 0.01 * breath
      })
    }
    case 'clap': {
      const clap = Math.abs(Math.sin(u * Math.PI * 2)) * e
      return pose({
        hips: [0.015 * e, 0, 0.01 * e],
        spine: [-0.02 * e, 0, 0],
        spine1: [-0.025 * e, 0, 0],
        spine2: [-0.02 * e, 0, 0],
        neck: [-0.02 * e, 0, 0],
        head: [-0.025 * e, 0, 0],
        leftShoulder: [-0.14 * e, 0.05 * e, 0.12 * e],
        rightShoulder: [-0.14 * e, -0.05 * e, -0.12 * e],
        leftArm: [-0.32 * e + 0.08 * clap, 0.1 * e, 0.2 * e - 0.1 * clap],
        rightArm: [-0.32 * e + 0.08 * clap, -0.1 * e, -0.2 * e + 0.1 * clap],
        leftForeArm: [0.55 * e, 0.1 * e, 0.45 * e],
        rightForeArm: [0.55 * e, -0.1 * e, -0.45 * e],
        leftHand: [0.1 * e, 0.05 * e, 0.08 * e],
        rightHand: [0.1 * e, -0.05 * e, -0.08 * e],
        bobY: 0.004 * clap
      })
    }
    case 'dismiss': {
      const wipe = Math.sin(u * Math.PI * 2) * e
      return pose({
        hips: [0.02 * e, -0.03 * e, 0.015 * e],
        spine: [0.025 * e, -0.05 * e, 0.02 * e],
        spine1: [0.03 * e, -0.06 * e, 0.025 * e],
        spine2: [0.025 * e, -0.07 * e, 0.03 * e],
        neck: [-0.02 * e, -0.05 * e, 0.02 * e],
        head: [-0.025 * e, -0.06 * e, 0.02 * e],
        leftShoulder: [0.02 * e, 0, 0.03 * e],
        rightShoulder: [-0.16 * e, 0.08 * e, -0.2 * e],
        leftArm: [0.03 * e, -0.02 * e, 0.04 * e],
        rightArm: [-0.3 * e, 0.12 * e, -0.28 * e],
        leftForeArm: [0.04 * e, 0, 0.03 * e],
        rightForeArm: [0.35 * e, 0.08 * e, -0.4 * e + 0.35 * wipe],
        rightHand: [0.1 * e, 0.2 * wipe, -0.15 * e],
        bobY: 0.003 * e
      })
    }
    case 'cheer': {
      // Small celebration only — no jumping jacks
      return pose({
        hips: [0.02 * e, 0, 0.015 * e],
        spine: [-0.04 * e, 0, 0],
        spine1: [-0.05 * e, 0, 0],
        spine2: [-0.04 * e, 0, 0],
        neck: [-0.05 * e, 0, 0],
        head: [-0.06 * e, 0, 0],
        leftShoulder: [-0.18 * e, 0.06 * e, 0.2 * e],
        rightShoulder: [-0.18 * e, -0.06 * e, -0.2 * e],
        leftArm: [-0.4 * e, 0.14 * e, 0.3 * e],
        rightArm: [-0.4 * e, -0.14 * e, -0.3 * e],
        leftForeArm: [0.3 * e, 0.08 * e, 0.25 * e],
        rightForeArm: [0.3 * e, -0.08 * e, -0.25 * e],
        leftHand: [0.08 * e, 0.05 * e, 0.08 * e],
        rightHand: [0.08 * e, -0.05 * e, -0.08 * e],
        bobY: 0.012 * e
      })
    }
    case 'offer': {
      return pose({
        hips: [0.015 * e, 0.02 * e, 0.015 * e],
        spine: [-0.02 * e, 0.03 * e, 0],
        spine1: [-0.025 * e, 0.035 * e, 0],
        spine2: [-0.02 * e, 0.04 * e, 0],
        neck: [-0.03 * e, 0.03 * e, 0],
        head: [-0.035 * e, 0.035 * e, 0],
        leftShoulder: [-0.14 * e, 0.06 * e, 0.12 * e],
        rightShoulder: [0.02 * e, 0, -0.03 * e],
        leftArm: [-0.32 * e, 0.12 * e, 0.2 * e],
        rightArm: [0.03 * e, -0.02 * e, -0.04 * e],
        leftForeArm: [0.4 * e, 0.1 * e, 0.35 * e],
        rightForeArm: [0.04 * e, 0, 0.02 * e],
        leftHand: [0.1 * e, 0.06 * e, 0.1 * e],
        bobY: 0.005 * e
      })
    }
    case 'glance': {
      const yaw = Math.sin(u * Math.PI) * e
      const side = u < 0.5 ? 1 : -0.35
      return pose({
        hips: [0.008 * e, 0.02 * yaw * side, 0],
        spine: [0.012 * e, 0.04 * yaw * side, 0],
        spine1: [0.015 * e, 0.05 * yaw * side, 0],
        spine2: [0.014 * e, 0.055 * yaw * side, 0],
        neck: [0.01 * e, 0.15 * yaw * side, 0.02 * e],
        head: [0.015 * e, 0.2 * yaw * side, 0.025 * e],
        leftShoulder: [0.01 * e, 0, 0.015 * e],
        rightShoulder: [0.01 * e, 0, -0.015 * e],
        leftArm: [0.015 * e, 0, 0.015 * e],
        rightArm: [0.015 * e, 0, -0.015 * e],
        bobY: 0
      })
    }
    default:
      return ZERO_POSE
  }
}

/** Soft side-hang after bind: mostly world -Y, slight outward so arms clear the torso. */
function hangArmsAtSides(rig: IdleRig) {
  // Tune these world dirs (not local Euler) — see docs/auntie-dot-arm-pose.md trial E.
  // Model faces -Z, camera looks from -Z: −Z = toward camera, +Z = behind her back.
  // Larger |X| = farther from hips.
  aimBoneWorld(rig.leftArm, new Vector3(-0.22, -1, -0.12))
  aimBoneWorld(rig.rightArm, new Vector3(0.22, -1, -0.12))
  // Keep bind forearm rest — extra local bend was folding hands together in front.
}

/** Prefer bones from SkinnedMesh.skeleton — those are what actually deform the mesh. */
function collectSkeletonBones(root: Object3D): Object3D[] {
  const fromSkins: Object3D[] = []
  const seen = new Set<Object3D>()
  root.traverse((obj) => {
    const mesh = obj as SkinnedMesh
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return
    for (const bone of mesh.skeleton.bones) {
      if (seen.has(bone)) continue
      seen.add(bone)
      fromSkins.push(bone)
    }
  })
  if (fromSkins.length) return fromSkins

  const fallback: Object3D[] = []
  root.traverse((obj) => {
    if ((obj as Bone).isBone) fallback.push(obj)
  })
  return fallback
}

function pickBone(bones: Object3D[], matcher: (compact: string) => boolean): BoneHandle | undefined {
  let best: Object3D | undefined
  for (const bone of bones) {
    if (!bone.name) continue
    const n = compactName(bone.name)
    if (n.includes('end') || n.includes('top')) continue
    if (!matcher(n)) continue
    best = bone
  }
  return best ? { node: best, rest: best.quaternion.clone() } : undefined
}

function isValveBipedRig(bones: Object3D[]): boolean {
  return bones.some((b) => {
    const n = compactName(b.name)
    return n.includes('valvebiped') || n.includes('bip01')
  })
}

function buildIdleRig(root: Object3D): IdleRig {
  const bones = collectSkeletonBones(root)

  // Source / GMod player skeleton
  if (isValveBipedRig(bones)) {
    return {
      valve: true,
      hips: pickBone(bones, (n) => n.includes('bip01pelvis')),
      spine: pickBone(bones, (n) => n.includes('bip01spine') && !/spine\d/.test(n)),
      spine1: pickBone(bones, (n) => n.includes('bip01spine1')),
      spine2: pickBone(bones, (n) => n.includes('bip01spine2') || n.includes('bip01spine4')),
      neck: pickBone(bones, (n) => n.includes('bip01neck')),
      head: pickBone(bones, (n) => n.includes('bip01head')),
      leftShoulder: pickBone(bones, (n) => n.includes('bip01lclavicle')),
      rightShoulder: pickBone(bones, (n) => n.includes('bip01rclavicle')),
      leftArm: pickBone(bones, (n) => n.includes('bip01lupperarm')),
      rightArm: pickBone(bones, (n) => n.includes('bip01rupperarm')),
      leftForeArm: pickBone(bones, (n) => n.includes('bip01lforearm')),
      rightForeArm: pickBone(bones, (n) => n.includes('bip01rforearm')),
      leftHand: pickBone(bones, (n) => n.includes('bip01lhand') && !n.includes('finger')),
      rightHand: pickBone(bones, (n) => n.includes('bip01rhand') && !n.includes('finger'))
    }
  }

  // Mixamo / Sketchfab v1
  return {
    valve: false,
    hips: pickBone(bones, (n) => n.includes('hips')),
    spine: pickBone(bones, (n) => n.includes('spine') && !n.includes('spine1') && !n.includes('spine2')),
    spine1: pickBone(bones, (n) => n.includes('spine1')),
    spine2: pickBone(bones, (n) => n.includes('spine2')),
    neck: pickBone(bones, (n) => n.includes('neck') && !n.includes('adj') && !n.startsWith('head')),
    head: pickBone(bones, (n) => (n.includes('head') || n.endsWith('head')) && !n.includes('headbase') && !n.includes('eyebrow') && !n.includes('teeth') && !n.includes('jaw') && !n.includes('lip') && !n.includes('tongue') && !n.includes('cheek') && !n.includes('eyeball') && !n.includes('mouth') && !n.includes('nostril')),
    leftShoulder: pickBone(bones, (n) => n.includes('leftshoulder')),
    rightShoulder: pickBone(bones, (n) => n.includes('rightshoulder')),
    leftArm: pickBone(bones, (n) => n.includes('leftarm') && !n.includes('fore')),
    rightArm: pickBone(bones, (n) => n.includes('rightarm') && !n.includes('fore')),
    leftForeArm: pickBone(bones, (n) => n.includes('leftforearm')),
    rightForeArm: pickBone(bones, (n) => n.includes('rightforearm')),
    leftHand: pickBone(
      bones,
      (n) =>
        n.includes('lefthand') &&
        !n.includes('thumb') &&
        !n.includes('index') &&
        !n.includes('middle') &&
        !n.includes('ring') &&
        !n.includes('pinky')
    ),
    rightHand: pickBone(
      bones,
      (n) =>
        n.includes('righthand') &&
        !n.includes('thumb') &&
        !n.includes('index') &&
        !n.includes('middle') &&
        !n.includes('ring') &&
        !n.includes('pinky')
    )
  }
}

function applyBone(handle: BoneHandle | undefined, x: number, y: number, z: number) {
  if (!handle) return
  _euler.set(x, y, z, 'XYZ')
  _quat.setFromEuler(_euler)
  handle.node.quaternion.copy(handle.rest).multiply(_quat)
}

function isBoneHandle(value: unknown): value is BoneHandle {
  return Boolean(value && typeof value === 'object' && 'node' in value && 'rest' in value)
}

/**
 * Frame from Mixamo bones — SkinnedMesh AABBs ignore pose and often crop to a body part.
 * Pull back for a clear waist-up dock shot.
 */
type BustFraming = {
  x: number
  y: number
  z: number
  lookY: number
  lookZ: number
  near: number
  far: number
}

function fitBustCamera(root: Group, rig: IdleRig, camera: PerspectiveCamera, pullBack = 1): BustFraming {
  root.updateWorldMatrix(true, true)

  const headPos = new Vector3()
  const hipsPos = new Vector3()
  if (rig.head) rig.head.node.getWorldPosition(headPos)
  if (rig.hips) rig.hips.node.getWorldPosition(hipsPos)

  // Fallback if bones missing
  if (!rig.head || !rig.hips) {
    const box = new Box3().setFromObject(root)
    const center = new Vector3()
    const size = new Vector3()
    box.getCenter(center)
    box.getSize(size)
    const dist = Math.max(size.y, 1) * 2.4 * pullBack
    return {
      x: center.x,
      y: center.y + size.y * 0.1,
      z: center.z - dist,
      lookY: center.y + size.y * 0.15,
      lookZ: center.z,
      near: Math.max(0.05, dist / 80),
      far: Math.max(60, dist * 20)
    }
  }

  const torso = Math.max(0.35, Math.abs(headPos.y - hipsPos.y))
  // Bust framing — tight enough to fill the dock panel, still waist-up (not a head crop).
  const IDEAL_BUST_VIEW = 1.18
  const viewHeight = pullBack > 1 ? torso * 2.2 : torso * IDEAL_BUST_VIEW
  const midX = (headPos.x + hipsPos.x) * 0.5
  const midZ = (headPos.z + hipsPos.z) * 0.5
  const hairPad = torso * 0.28
  const targetY =
    pullBack > 1 ? hipsPos.y + torso * 0.45 : headPos.y + hairPad - viewHeight / 2

  const fov = (camera.fov * Math.PI) / 180
  const dist = viewHeight / (2 * Math.tan(fov / 2))

  return {
    x: midX,
    y: targetY,
    z: midZ - dist,
    lookY: targetY,
    lookZ: midZ,
    near: Math.max(0.05, dist / 80),
    far: Math.max(60, dist * 20)
  }
}

function applyFraming(camera: PerspectiveCamera, f: BustFraming) {
  camera.position.set(f.x, f.y, f.z)
  camera.near = f.near
  camera.far = f.far
  camera.lookAt(f.x, f.lookY, f.lookZ)
  camera.updateProjectionMatrix()
}

type ActiveGesture = {
  name: AuntieDotGesture
  start: number
  duration: number
}

type SyllablePulse = { at: number; width: number; level: number }

function CortanaFigure({
  mode,
  gesture,
  gestureKey = 0,
  autoGestures = true,
  talkKick = 0,
  talkSyllables = 1
}: {
  mode: AuntieDotAvatarMode
  gesture?: AuntieDotGesture | null
  /** Bump to re-trigger the same gesture name. */
  gestureKey?: number
  autoGestures?: boolean
  /** Increment on TTS word boundaries to spike the jaw. */
  talkKick?: number
  /** Syllables in the current word — one jaw pulse each. */
  talkSyllables?: number
}) {
  const modelSrc = useMemo(
    () =>
      resolveAuntieDotModelSrc(
        typeof window !== 'undefined' ? window.location.search : ''
      ),
    []
  )
  const { scene } = useGLTF(modelSrc)
  const root = useRef<Group>(null)
  const bob = useRef<Group>(null)
  const rigRef = useRef<IdleRig | null>(null)
  const skinsRef = useRef<SkinnedMesh[]>([])
  const mouthRef = useRef<MouthDriver | null>(null)
  const { camera, gl, size } = useThree()
  const fitted = useRef(false)
  const framingRef = useRef<BustFraming | null>(null)
  const activeGesture = useRef<ActiveGesture | null>(null)
  const pendingGesture = useRef<AuntieDotGesture | null>(null)
  const nextAutoAt = useRef(3)
  const lastGestureKey = useRef(-1)
  const lastTalkKick = useRef(0)
  const talkOpen = useRef(0)
  /** Per-syllable open peaks scheduled from the latest spoken word. */
  const syllablePulses = useRef<SyllablePulse[]>([])
  /** Extra-smoothed jaw used for bones — hides phoneme teleports. */
  const jawVisual = useRef(0)
  const pointerNdc = useRef({ x: 0, y: 0 })
  const pointerMovedAt = useRef(0)
  const lookSmooth = useRef({ yaw: 0, pitch: 0 })
  const lookIdlePhase = useRef(Math.random() * Math.PI * 2)
  const lastFrameT = useRef(0)
  const clockReady = useRef(false)
  const talkTestRef = useRef(false)

  // CRITICAL: scene.clone(true) breaks SkinnedMesh ↔ skeleton binding (frozen bind pose).
  // SkeletonUtils.clone keeps skinning intact so bone motion actually deforms the mesh.
  const model = useMemo(() => cloneSkinned(scene) as Group, [scene])

  useEffect(() => {
    if (!gesture) return
    if (gestureKey === lastGestureKey.current) return
    lastGestureKey.current = gestureKey
    // Queue for the r3f clock (performance.now ≠ clock.elapsedTime).
    activeGesture.current = null
    pendingGesture.current = gesture
  }, [gesture, gestureKey])

  useEffect(() => {
    if (talkKick === lastTalkKick.current) return
    lastTalkKick.current = talkKick
    const count = MathUtils.clamp(Math.round(talkSyllables), 1, 8)
    const now = performance.now()
    // ~155ms per syllable at briefing rate; multi-syllable words get several open/close beats.
    const span = MathUtils.clamp(count * 155, 155, 720)
    const width = MathUtils.clamp(58 + 8 * (4 - Math.min(count, 4)), 48, 90)
    const pulses: SyllablePulse[] = []
    for (let i = 0; i < count; i++) {
      const at = now + (count === 1 ? 0 : (i / count) * span * 0.92)
      // First syllable slightly stronger (stress); later ones a bit lighter.
      const level = MathUtils.clamp(0.55 - i * 0.06, 0.32, 0.58)
      pulses.push({ at, width, level })
    }
    syllablePulses.current = pulses
    talkOpen.current = Math.max(talkOpen.current, pulses[0]!.level)
  }, [talkKick, talkSyllables])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const q = new URLSearchParams(window.location.search)
    // talktest=1 only — fake jaw. talkpoc uses real speech boundaries.
    talkTestRef.current = q.get('talktest') === '1'
  }, [])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (rect.width < 1 || rect.height < 1) return
      // Follow cursor across the page — feels more alive than canvas-only.
      const cx = rect.left + rect.width * 0.5
      const cy = rect.top + rect.height * 0.5
      const nx = MathUtils.clamp((event.clientX - cx) / (rect.width * 0.85), -1, 1)
      const ny = MathUtils.clamp((cy - event.clientY) / (rect.height * 0.85), -1, 1)
      pointerNdc.current.x = nx
      pointerNdc.current.y = ny
      pointerMovedAt.current = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [gl])

  useLayoutEffect(() => {
    const g = root.current
    if (!g) return
    // Always re-fit on layout (HMR / prop remounts). Guarding with fitted.current
    // left the camera stuck on an old pull-back after framing tweaks.
    fitted.current = false

    const skins: SkinnedMesh[] = []
    const meshKinds: string[] = []
    model.traverse((obj) => {
      const mesh = obj as SkinnedMesh
      meshKinds.push(
        `${obj.type}:${obj.name || '(unnamed)'}:skinned=${Boolean(mesh.isSkinnedMesh)}:bones=${mesh.skeleton?.bones?.length ?? 0}`
      )
      if (mesh.isSkinnedMesh) {
        skins.push(mesh)
        mesh.frustumCulled = false
      }
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) {
        const standard = mat as MeshStandardMaterial
        if (!standard || !('color' in standard)) continue
        const matName = standard.name || ''
        // Eyes lost Source cornea textures — soft hologram iris (not blown-out white).
        if (/cortana_[lr]$/i.test(matName) && !standard.map) {
          standard.color = new Color('#0a2a3c')
          standard.emissive = new Color('#5ec8ef')
          standard.emissiveIntensity = 0.55
          if ('metalness' in standard) standard.metalness = 0.15
          if ('roughness' in standard) standard.roughness = 0.35
          standard.needsUpdate = true
          continue
        }
        // Inner mouth / teeth stay darker so the oral cavity reads.
        if (/cavity|mouth|teeth|tongue/i.test(matName)) {
          if (/teeth|tongue/i.test(matName)) {
            standard.emissive = new Color('#1a4060')
            standard.emissiveIntensity = 0.12
          }
          standard.needsUpdate = true
          continue
        }
        // Hologram wash — stronger on body panels, softer on face/hair so texture reads.
        const faceish = /face|hair|lash|eye/i.test(matName)
        standard.emissive = new Color(faceish ? '#2f7aa8' : '#3a8ab8')
        standard.emissiveIntensity = faceish ? 0.32 : 0.5
        standard.envMapIntensity = 1
        if ('metalness' in standard) standard.metalness = Math.min(standard.metalness ?? 0.2, 0.28)
        if ('roughness' in standard && faceish) {
          standard.roughness = Math.max(standard.roughness ?? 0.45, 0.35)
        }
        // Hair/lashes often need alpha; keep double-sided.
        if (/hair|lash/i.test(matName)) {
          standard.transparent = true
          standard.depthWrite = false
          standard.side = DoubleSide
        }
        standard.needsUpdate = true
      }
    })
    skinsRef.current = skins

    // Reset to bind pose before capturing rest quats (posed frames stick forever).
    for (const skin of skins) {
      skin.skeleton?.pose()
      skin.skeleton?.update()
    }

    // Both GMod SourceIO and Sketchfab v1 exports face +Z; camera looks from −Z → yaw 180°.
    model.rotation.y = Math.PI
    model.updateWorldMatrix(true, true)

    const rig = buildIdleRig(model)
    // Hang first so scale/framing aren't measured on a wide T-pose (that shrunk her).
    hangArmsAtSides(rig)
    model.updateWorldMatrix(true, true)
    for (const skin of skins) skin.skeleton?.update()

    // Scale by standing height only — arm span must not shrink the bust.
    g.scale.setScalar(1)
    g.position.set(0, 0, 0)
    g.updateWorldMatrix(true, true)
    const box = new Box3().setFromObject(g)
    const dims = new Vector3()
    box.getSize(dims)
    const height = Math.max(dims.y, 0.001)
    g.scale.setScalar(1.7 / height)

    const box2 = new Box3().setFromObject(g)
    const center = new Vector3()
    box2.getCenter(center)
    g.position.set(-center.x, -box2.min.y, -center.z)
    g.updateWorldMatrix(true, true)
    for (const skin of skins) skin.skeleton?.update()
    rigRef.current = rig

    mouthRef.current = ensureMouthOpenMorph(model)

    // Prove skinning link: skeleton bone === scene-graph bone we animate
    let linked = 0
    for (const skin of skins) {
      for (const bone of skin.skeleton.bones) {
        if (rig.rightArm && bone === rig.rightArm.node) linked += 1
        if (rig.leftArm && bone === rig.leftArm.node) linked += 1
      }
    }

    if (process.env.NODE_ENV === 'development') {
      const bound = Object.entries(rig)
        .filter(([, h]) => isBoneHandle(h))
        .map(([k, h]) => `${k}:${(h as BoneHandle).node.name}`)
      console.info('[AuntieDotAvatar] skinned idle rig', {
        skins: skins.length,
        linkedArmBones: linked,
        bones: bound,
        mouth: mouthRef.current
          ? {
              mesh: mouthRef.current.mesh.name,
              index: mouthRef.current.index,
              targets: mouthRef.current.targets.map(
                (t) => `${t.mesh.name}#${t.index}@${t.weight}`
              ),
              faceBones: Object.fromEntries(
                Object.entries(mouthRef.current.faceBones)
                  .filter(([, h]) => h)
                  .map(([k, h]) => [k, h!.node.name])
              ),
              influences: mouthRef.current.mesh.morphTargetInfluences?.length ?? 0,
              dict: mouthRef.current.mesh.morphTargetDictionary
            }
          : null,
        meshKinds: meshKinds.filter((m) => m.includes('Mesh') || m.includes('Bone')).slice(0, 40)
      })
      const m = mouthRef.current?.mesh
      const morphPos = m?.geometry?.morphAttributes?.position?.[0]
      let maxDelta = 0
      if (morphPos) {
        const arr = morphPos.array as ArrayLike<number>
        for (let i = 0; i < arr.length; i++) maxDelta = Math.max(maxDelta, Math.abs(arr[i]))
      }
      ;(window as unknown as { __cortanaFace?: unknown; __cortanaMouthMesh?: SkinnedMesh }).__cortanaFace =
        {
          mouth: mouthRef.current
            ? {
                mesh: mouthRef.current.mesh.name,
                index: mouthRef.current.index,
                faceBones: Object.fromEntries(
                  Object.entries(mouthRef.current.faceBones)
                    .filter(([, h]) => h)
                    .map(([k, h]) => [k, h!.node.name])
                ),
                dict: mouthRef.current.mesh.morphTargetDictionary,
                relative: m?.geometry?.morphTargetsRelative ?? null,
                morphAttrCount: morphPos?.count ?? 0,
                maxDelta: +maxDelta.toFixed(5),
                matMorph: Array.isArray(m?.material)
                  ? (m?.material[0] as MeshStandardMaterial & { morphTargets?: boolean })?.morphTargets
                  : (m?.material as MeshStandardMaterial & { morphTargets?: boolean })?.morphTargets
              }
            : null,
          skinned: skins.map((s) => s.name),
          rigBones: Object.entries(rig)
            .filter(([, h]) => isBoneHandle(h))
            .map(([k, h]) => `${k}:${(h as BoneHandle).node.name}`),
          valve: rig.valve
        }
      if (m) {
        ;(window as unknown as { __cortanaMouthMesh?: SkinnedMesh }).__cortanaMouthMesh = m
      }
    }

    // ?armdebug=1: pulled back for limb debugging only — not the normal bust framing
    const armDebug =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('armdebug') === '1'

    // Canvas aspect must be real before project()/fit or head NDC is wrong.
    const cam = camera as PerspectiveCamera
    const w = size.width || gl.domElement.clientWidth || 1
    const h = size.height || gl.domElement.clientHeight || 1
    cam.aspect = w / Math.max(1, h)
    cam.updateProjectionMatrix()

    const framing = fitBustCamera(g, rig, cam, armDebug ? 2.2 : 1)
    framingRef.current = framing
    applyFraming(cam, framing)
    fitted.current = true
    clockReady.current = false

    // ?gesture=<name> — fire once after fit for tuning
    if (typeof window !== 'undefined') {
      const gName = new URLSearchParams(window.location.search).get('gesture')
      if (gName && isAuntieDotGesture(gName)) pendingGesture.current = gName
    }
  }, [camera, gl, model, size.height, size.width])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const rig = rigRef.current

    // Re-assert bust framing every frame — R3F can clobber camera after layout.
    if (framingRef.current) {
      const cam = camera as PerspectiveCamera
      const w = size.width || 1
      const h = size.height || 1
      cam.aspect = w / h
      applyFraming(cam, framingRef.current)
    }

    if (!clockReady.current) {
      clockReady.current = true
      nextAutoAt.current = t + 2.8
    }

    // Start queued clips as soon as the rig exists (must be before any early logic that skips a frame).
    if (rig && pendingGesture.current && !activeGesture.current) {
      const name = pendingGesture.current
      pendingGesture.current = null
      activeGesture.current = {
        name,
        start: t,
        duration: GESTURE_DURATION[name]
      }
      nextAutoAt.current = t + GESTURE_DURATION[name] + IDLE_GESTURE_MIN_S
      if (process.env.NODE_ENV === 'development') {
        console.info('[AuntieDotAvatar] gesture start', name)
      }
    }

    if (!rig) return

    const faceDebug =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('facedebug') === '1'

    // Opportunistic signatures — mode picks a sane subset, never during heavy speech
    if (
      autoGestures &&
      !faceDebug &&
      !activeGesture.current &&
      !pendingGesture.current &&
      mode !== 'speaking' &&
      t >= nextAutoAt.current
    ) {
      const pool =
        mode === 'thinking'
          ? (['think', 'scan', 'confused', 'settle', 'glance'] as AuntieDotGesture[])
          : mode === 'listening'
            ? (['listen', 'nod', 'affirm', 'settle', 'glance'] as AuntieDotGesture[])
            : IDLE_GESTURE_POOL
      const pick = pool[Math.floor(Math.random() * pool.length)]!
      activeGesture.current = {
        name: pick,
        start: t,
        duration: GESTURE_DURATION[pick]
      }
      nextAutoAt.current =
        t +
        GESTURE_DURATION[pick] +
        IDLE_GESTURE_MIN_S +
        Math.random() * (IDLE_GESTURE_MAX_S - IDLE_GESTURE_MIN_S)
    }

    let gest = activeGesture.current
    let gestU = 0
    if (gest) {
      gestU = (t - gest.start) / gest.duration
      if (gestU >= 1) {
        activeGesture.current = null
        gest = null
        gestU = 0
        nextAutoAt.current =
          t + IDLE_GESTURE_MIN_S + Math.random() * (IDLE_GESTURE_MAX_S - IDLE_GESTURE_MIN_S)
      }
    }

    const energy =
      mode === 'speaking' ? 1.25 : mode === 'listening' ? 1.1 : mode === 'thinking' ? 1.05 : 1

    // Calm human idle — breath + tiny drift. Full-body gesture pose layers on top.
    const breath = Math.sin(t * 1.15) * energy
    const weight = Math.sin(t * 0.35 + 0.4) * energy
    const headDrift = Math.sin(t * 0.22 + 0.8) * energy
    const armDriftL = Math.sin(t * 0.55 + 0.3) * energy
    const armDriftR = Math.sin(t * 0.55 + 2.1) * energy

    const listenLean = mode === 'listening' ? 0.03 : 0
    const thinkTilt = mode === 'thinking' ? 0.04 : 0

    const env = gest ? gestureEnvelope(gestU) : 0
    const gestName = gest?.name
    const gPose = gestName ? sampleGestureBody(gestName, gestU, env) : ZERO_POSE
    // Soften idle while a big gesture owns the body
    const idleFade = 1 - env * 0.65
    // Keep look readable during QA even if a wave is playing.
    const lookFade = faceDebug ? 1 : 1 - env * 0.85

    // --- Talk jaw + look targets ---
    const dt =
      lastFrameT.current <= 0 ? 1 / 60 : Math.min(0.05, Math.max(0.001, t - lastFrameT.current))
    lastFrameT.current = t

    // Fake jaw only for facedebug / ?talktest=1.
    // Live speech: triangle pulses per syllable (open → close → open on long words).
    let talkTarget = 0
    if (faceDebug || talkTestRef.current) {
      talkTarget = sampleTalkJaw(t)
    } else {
      const now = performance.now()
      const pulses = syllablePulses.current
      let peak = 0
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i]!
        const d = Math.abs(now - p.at)
        if (d >= p.width) continue
        // Triangle envelope — closed between syllable beats.
        peak = Math.max(peak, p.level * (1 - d / p.width))
      }
      // Drop finished pulses so the array stays short.
      if (pulses.length > 0 && now > pulses[pulses.length - 1]!.at + pulses[pulses.length - 1]!.width) {
        syllablePulses.current = []
      }
      talkTarget = peak
    }
    const jawLambda =
      talkTarget < talkOpen.current ? JAW_CLOSE_SMOOTH : JAW_OPEN_SMOOTH
    talkOpen.current = MathUtils.damp(talkOpen.current, talkTarget, jawLambda, dt)
    const forceJaw = (window as unknown as { __cortanaForceJaw?: number }).__cortanaForceJaw
    if (typeof forceJaw === 'number') {
      jawVisual.current = MathUtils.clamp(forceJaw, 0, 1)
    } else {
      // One smooth stage — a second damp held her mid-open forever.
      jawVisual.current = talkOpen.current
    }
    const jaw = jawVisual.current
    const mouth = mouthRef.current
    if (mouth) {
      // Real morph deltas → morphs; this GMod export's FACS slots are empty → jaw bones.
      const hasMorph = mouth.targets.length > 0
      if (hasMorph) {
        for (const t of mouth.targets) {
          if (t.mesh.morphTargetInfluences) {
            t.mesh.morphTargetInfluences[t.index] = MathUtils.clamp(jaw * t.weight, 0, 1)
          }
        }
        applyTalkFaceBones(mouth.faceBones, 0)
      } else {
        if (mouth.mesh.morphTargetInfluences) {
          for (let i = 0; i < mouth.mesh.morphTargetInfluences.length; i++) {
            mouth.mesh.morphTargetInfluences[i] = 0
          }
        }
        applyTalkFaceBones(mouth.faceBones, jaw)
      }
      const mats = Array.isArray(mouth.mesh.material) ? mouth.mesh.material : [mouth.mesh.material]
      const base = mouth.baseEmissive ?? 0.45
      for (const mat of mats) {
        if (mat && 'emissiveIntensity' in mat) {
          ;(mat as MeshStandardMaterial).emissiveIntensity = base + jaw * 0.22
        }
      }
    }

    // --- Loose look-at (pointer) — yaw/pitch in view space, then aim in world ---
    // Screen +X → look toward screen-right; screen +Y (mouse above) → look up.
    let desiredYaw = lookResponse(pointerNdc.current.x, LOOK_YAW_MAX)
    let desiredPitch = lookResponse(pointerNdc.current.y, LOOK_PITCH_MAX)
    // Idle glance when the cursor hasn't moved — keeps her alive without a mouse.
    const idleMs = performance.now() - pointerMovedAt.current
    if (!faceDebug && idleMs > 2200) {
      const phase = lookIdlePhase.current + t * 0.35
      desiredYaw += Math.sin(phase) * 0.1
      desiredPitch += Math.sin(phase * 0.7 + 0.4) * 0.045
      desiredYaw = MathUtils.clamp(desiredYaw, -LOOK_YAW_MAX, LOOK_YAW_MAX)
      desiredPitch = MathUtils.clamp(desiredPitch, -LOOK_PITCH_MAX, LOOK_PITCH_MAX)
    }
    // ?facedebug=1 — auto figure-8 look so QA doesn't need a mouse
    if (faceDebug) {
      desiredYaw = Math.sin(t * 0.75) * 0.5
      desiredPitch = Math.sin(t * 1.1) * 0.22
    }
    const force = (window as unknown as { __cortanaForceLook?: { yaw?: number; pitch?: number } })
      .__cortanaForceLook
    if (force) {
      if (typeof force.yaw === 'number') desiredYaw = force.yaw
      if (typeof force.pitch === 'number') desiredPitch = force.pitch
    }
    lookSmooth.current.yaw = MathUtils.damp(lookSmooth.current.yaw, desiredYaw, LOOK_SMOOTH, dt)
    lookSmooth.current.pitch = MathUtils.damp(
      lookSmooth.current.pitch,
      desiredPitch,
      LOOK_SMOOTH,
      dt
    )
    const lookYaw = lookSmooth.current.yaw * lookFade
    const lookPitch = lookSmooth.current.pitch * lookFade
    // World look direction: faces camera (−Z), yaw toward ±X, pitch toward ±Y.
    _lookDir
      .set(
        Math.sin(lookYaw) * Math.cos(lookPitch),
        Math.sin(lookPitch),
        -Math.cos(lookYaw) * Math.cos(lookPitch)
      )
      .normalize()

    if (bob.current) {
      const baseBob = Math.sin(t * 0.9) * 0.004 * idleFade
      bob.current.position.y = baseBob + gPose.bobY
    }

    const hips = addPose([0.012 * weight * idleFade, 0.02 * weight * idleFade, 0.008 * breath * idleFade], gPose.hips)
    applyBone(rig.hips, hips[0], hips[1], hips[2])

    const spine = addPose(
      [0.035 * breath * idleFade + listenLean, 0.02 * weight * idleFade, 0],
      gPose.spine
    )
    applyBone(rig.spine, spine[0], spine[1], spine[2])

    const spine1 = addPose([0.04 * breath * idleFade, 0.018 * weight * idleFade, 0], gPose.spine1)
    applyBone(rig.spine1, spine1[0], spine1[1], spine1[2])

    const spine2 = addPose([0.032 * breath * idleFade, 0.015 * weight * idleFade, 0], gPose.spine2)
    applyBone(rig.spine2, spine2[0], spine2[1], spine2[2])

    // Idle breath/gesture on neck+head, then look.
    // Valve: local X = yaw (world up), local Y = roll — do NOT put idle drift on Y or she leans to a shoulder.
    const neck = addPose(
      rig.valve
        ? [
            0.015 * breath * idleFade + listenLean * 0.4 + 0.03 * headDrift * idleFade,
            thinkTilt * 0.25,
            0
          ]
        : [
            0.015 * breath * idleFade + listenLean * 0.4,
            0.03 * headDrift * idleFade + thinkTilt,
            0
          ],
      gPose.neck
    )
    const head = addPose(
      rig.valve
        ? [
            0.02 * breath * idleFade + 0.035 * headDrift * idleFade,
            thinkTilt * 0.35,
            0.01 * weight * idleFade
          ]
        : [
            0.02 * breath * idleFade,
            0.04 * headDrift * idleFade + thinkTilt * 0.8,
            0.01 * weight * idleFade
          ],
      gPose.head
    )
    if (rig.valve) {
      // SourceIO ValveBiped: local +X ≈ world up (yaw), local +Z ≈ pitch.
      // Camera on −Z; face (−Y) toward camera. Pointer +X (screen right) → +local X.
      applyBone(
        rig.neck,
        neck[0] + lookYaw * 0.4,
        neck[1],
        neck[2] + lookPitch * 0.35
      )
      applyBone(
        rig.head,
        head[0] + lookYaw * 0.75,
        head[1],
        head[2] + lookPitch * 0.7
      )
    } else {
      applyBone(rig.neck, neck[0], neck[1], neck[2])
      applyBone(rig.head, head[0], head[1], head[2])
      applyWorldLook(rig.neck, _lookDir, 0.4, _faceLocalDefault)
      applyWorldLook(rig.head, _lookDir, 0.85, _faceLocalDefault)
    }

    const lSho = addPose([0.008 * breath * idleFade, 0, 0.012 * armDriftL * idleFade], gPose.leftShoulder)
    const rSho = addPose([0.008 * breath * idleFade, 0, -0.012 * armDriftR * idleFade], gPose.rightShoulder)
    applyBone(rig.leftShoulder, lSho[0], lSho[1], lSho[2])
    applyBone(rig.rightShoulder, rSho[0], rSho[1], rSho[2])

    const lArm = addPose(
      [0.015 * armDriftL * idleFade, 0.01 * armDriftL * idleFade, 0.015 * armDriftL * idleFade],
      gPose.leftArm
    )
    const rArm = addPose(
      [0.015 * armDriftR * idleFade, -0.01 * armDriftR * idleFade, -0.015 * armDriftR * idleFade],
      gPose.rightArm
    )
    applyBone(rig.leftArm, lArm[0], lArm[1], lArm[2])
    applyBone(rig.rightArm, rArm[0], rArm[1], rArm[2])

    const lFore = addPose([0.01 * armDriftL * idleFade, 0, 0], gPose.leftForeArm)
    const rFore = addPose([0.01 * armDriftR * idleFade, 0, 0], gPose.rightForeArm)
    applyBone(rig.leftForeArm, lFore[0], lFore[1], lFore[2])
    applyBone(rig.rightForeArm, rFore[0], rFore[1], rFore[2])

    applyBone(rig.leftHand, gPose.leftHand[0], gPose.leftHand[1], gPose.leftHand[2])
    applyBone(rig.rightHand, gPose.rightHand[0], gPose.rightHand[1], gPose.rightHand[2])

    // World-aim assist for clips that need a hand in the bust frame
    const aimKind = gestName ? ARM_AIM_GESTURE[gestName] : undefined
    if (aimKind && env > 0.001 && rig.rightArm) {
      const dir =
        aimKind === 'salute'
          ? _saluteDir
          : aimKind === 'point'
            ? _pointDir
            : aimKind === 'think'
              ? _thinkDir
              : _waveDir
      const aim = computeAimLocalQuat(rig.rightArm, dir, _qAim)
      if (aim) {
        // Mild blend — body pose already carries most of the motion
        rig.rightArm.node.quaternion.slerp(aim, env * 0.55)
      }
    }

    for (const skin of skinsRef.current) {
      skin.skeleton?.update()
    }

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const prev = (window as unknown as { __cortanaFace?: Record<string, unknown> }).__cortanaFace
      const infl = mouth?.mesh.morphTargetInfluences?.[mouth.index]
      ;(window as unknown as { __cortanaFace?: Record<string, unknown> }).__cortanaFace = {
        ...(prev || {}),
        jaw: +jaw.toFixed(3),
        morph: infl != null ? +infl.toFixed(3) : null,
        lookYaw: +lookSmooth.current.yaw.toFixed(3),
        lookPitch: +lookSmooth.current.pitch.toFixed(3)
      }
    }
  })

  return (
    <group ref={bob}>
      <group ref={root}>
        <primitive object={model} />
      </group>
    </group>
  )
}

type AuntieDotAvatarProps = {
  mode: AuntieDotAvatarMode
  className?: string
  /** Play a signature clip (wave / salute / nod). */
  gesture?: AuntieDotGesture | null
  /** Change when re-firing the same gesture. */
  gestureKey?: number
  /** Occasional random signatures while idle (default true). */
  autoGestures?: boolean
  /** Bump on each TTS word boundary to spike mouth open. */
  talkKick?: number
  /** Syllable count for the word that triggered the latest talkKick. */
  talkSyllables?: number
}

export function AuntieDotAvatar({
  mode,
  className = '',
  gesture = null,
  gestureKey = 0,
  autoGestures = true,
  talkKick = 0,
  talkSyllables = 1
}: AuntieDotAvatarProps) {
  return (
    <div className={`auntie-avatar relative mx-auto w-full ${className}`}>
      <div className="relative h-56 w-full overflow-hidden bg-transparent sm:h-64">
        <Canvas
          className="!absolute inset-0 h-full w-full"
          camera={{ position: [0, 1.2, 2.8], fov: 32, near: 0.1, far: 50 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
          dpr={[1, 1.75]}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight position={[2.2, 3.4, 2]} intensity={1.5} color="#e8f4ff" />
          <directionalLight position={[-2.5, 1.2, -1]} intensity={0.75} color="#6eb8e8" />
          <directionalLight position={[0, 2, -3]} intensity={0.9} color="#c8e8ff" />
          <pointLight position={[0, 1.4, -1.2]} intensity={0.7} color="#9fd0f5" distance={6} />
          <Suspense fallback={null}>
            <CortanaFigure
              mode={mode}
              gesture={gesture}
              gestureKey={gestureKey}
              autoGestures={autoGestures}
              talkKick={talkKick}
              talkSyllables={talkSyllables}
            />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none absolute bottom-0.5 left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(140,210,255,0.45),transparent_70%)]" />
      </div>
    </div>
  )
}

useGLTF.preload(AUNTIE_DOT_MODEL_SRC)
if (typeof window !== 'undefined') {
  const src = resolveAuntieDotModelSrc(window.location.search)
  if (src !== AUNTIE_DOT_MODEL_SRC) useGLTF.preload(src)
} else {
  // SSR / first paint: default GMod already preloaded above.
}
