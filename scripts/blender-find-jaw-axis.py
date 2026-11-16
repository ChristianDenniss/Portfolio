"""Find which local jaw euler axis actually opens the mouth gap."""
from __future__ import annotations

import json
from pathlib import Path

import bpy
from mathutils import Euler

ROOT = Path(r"c:\Users\aottg\development\personal\projectPortfolio")
BLEND = ROOT / "public" / "models" / "candidates" / "cortana-gmod-rig-v2.blend"
GLB = ROOT / "public" / "models" / "candidates" / "cortana-gmod-rig-v2.glb"
OUT = ROOT / "scripts" / "cortana-jaw-axis-report.json"


def load() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if BLEND.is_file():
        bpy.ops.wm.open_mainfile(filepath=str(BLEND).replace("\\", "/"))
    else:
        bpy.ops.import_scene.gltf(filepath=str(GLB).replace("\\", "/"))


def find_armature():
    for o in bpy.data.objects:
        if o.type == "ARMATURE":
            return o
    raise RuntimeError("no armature")


def bone_key(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def find_pose_bone(arm, *needles: str):
    for pb in arm.pose.bones:
        key = bone_key(pb.name)
        if all(n in key for n in needles):
            return pb
    return None


def reset_pose(arm) -> None:
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)
        pb.location = (0.0, 0.0, 0.0)
    bpy.context.view_layer.update()


def lip_gap(arm) -> float:
    """World-space distance between upper/lower lip middle bones."""
    bpy.context.view_layer.update()
    upper = find_pose_bone(arm, "lipupper", "middle") or find_pose_bone(arm, "lipupper", "mid")
    lower = find_pose_bone(arm, "liplower", "middle") or find_pose_bone(arm, "liplower", "mid")
    jaw = find_pose_bone(arm, "headjaw") or find_pose_bone(arm, "jaw")
    if upper and lower:
        return (upper.head - lower.head).length
    if jaw and upper:
        return (upper.head - jaw.head).length
    return 0.0


def main() -> None:
    amount = 0.55
    load()
    arm = find_armature()
    reset_pose(arm)
    bpy.ops.object.mode_set(mode="POSE")
    base = lip_gap(arm)
    jaw = find_pose_bone(arm, "headjaw") or find_pose_bone(arm, "jaw")
    teeth = find_pose_bone(arm, "teethlower")
    if not jaw:
        raise RuntimeError("jaw bone not found")

    trials = []
    axes = {
        "x+": (amount, 0.0, 0.0),
        "x-": (-amount, 0.0, 0.0),
        "y+": (0.0, amount, 0.0),
        "y-": (0.0, -amount, 0.0),
        "z+": (0.0, 0.0, amount),
        "z-": (0.0, 0.0, -amount),
    }
    for label, xyz in axes.items():
        reset_pose(arm)
        bpy.ops.object.mode_set(mode="POSE")
        jaw.rotation_mode = "XYZ"
        jaw.rotation_euler = xyz
        if teeth:
            teeth.rotation_mode = "XYZ"
            teeth.rotation_euler = (xyz[0] * 0.9, xyz[1] * 0.9, xyz[2] * 0.9)
        gap = lip_gap(arm)
        trials.append(
            {
                "axis": label,
                "gap": round(gap, 5),
                "delta": round(gap - base, 5),
                "jaw_head": [round(c, 4) for c in jaw.head],
            }
        )

    trials.sort(key=lambda t: abs(t["delta"]), reverse=True)
    report = {
        "jaw_bone": jaw.name,
        "teeth_bone": teeth.name if teeth else None,
        "base_gap": round(base, 5),
        "amount": amount,
        "best": trials[0],
        "trials": trials,
    }
    OUT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
