"""
Bake a real mouthOpen shape key onto the GMod Cortana by posing Source facial bones.

  blender --background --python scripts/blender-bake-gmod-mouth.py
"""
from __future__ import annotations

import json
from pathlib import Path

import bpy
from mathutils import Euler

ROOT = Path(r"c:\Users\aottg\development\personal\projectPortfolio")
SRC_BLEND = ROOT / "public" / "models" / "candidates" / "cortana-gmod-rig-v2.blend"
SRC_GLB = ROOT / "public" / "models" / "candidates" / "cortana-gmod-rig-v2.glb"
OUT_GLB = ROOT / "public" / "models" / "candidates" / "cortana-gmod-rig-v2.glb"
OUT_ACTIVE = ROOT / "public" / "models" / "auntie-dot.glb"
REPORT = ROOT / "scripts" / "cortana-gmod-mouth-bake-report.json"

# Blender-verified: +X opens this Cortana jaw (see cortana-jaw-axis-report.json).
JAW_OPEN_RAD = 0.55


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def load_model() -> None:
    if SRC_BLEND.is_file():
        bpy.ops.wm.open_mainfile(filepath=str(SRC_BLEND).replace("\\", "/"))
        return
    if not SRC_GLB.is_file():
        raise FileNotFoundError(SRC_GLB)
    bpy.ops.import_scene.gltf(filepath=str(SRC_GLB).replace("\\", "/"))


def find_armature():
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            return obj
    raise RuntimeError("No armature found")


def find_meshes():
    return [o for o in bpy.data.objects if o.type == "MESH"]


def bone_name_key(name: str) -> str:
    return "".join(ch for ch in name.lower() if ch.isalnum())


def pose_mouth_open(arm) -> dict:
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    # Clear any leftover pose first
    for pb in arm.pose.bones:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0.0, 0.0, 0.0)
    moved = {}
    for pb in arm.pose.bones:
        key = bone_name_key(pb.name)
        euler = None
        if key.endswith("headjaw") or key == "headjaw":
            euler = Euler((JAW_OPEN_RAD, 0.0, 0.0), "XYZ")
        elif "teethlower" in key:
            euler = Euler((JAW_OPEN_RAD * 0.9, 0.0, 0.0), "XYZ")
        elif "liplower" in key and ("middle" in key or "mid" in key):
            euler = Euler((JAW_OPEN_RAD * 0.35, 0.0, 0.0), "XYZ")
        elif "lipupper" in key and ("middle" in key or "mid" in key):
            euler = Euler((-JAW_OPEN_RAD * 0.12, 0.0, 0.0), "XYZ")
        if euler is None:
            continue
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = euler
        moved[pb.name] = [round(v, 4) for v in euler]
    bpy.context.view_layer.update()
    return moved


def bake_mouth_open_on_meshes(meshes) -> list[dict]:
    reports = []
    for mesh in meshes:
        bpy.ops.object.mode_set(mode="OBJECT")
        bpy.ops.object.select_all(action="DESELECT")
        mesh.select_set(True)
        bpy.context.view_layer.objects.active = mesh

        # Ensure a basis key exists (SourceIO names it "base")
        if not mesh.data.shape_keys:
            mesh.shape_key_add(name="Basis", from_mix=False)

        keys = mesh.data.shape_keys.key_blocks
        basis = keys.get("Basis") or keys.get("base") or keys[0]
        if "mouthOpen" in keys:
            mesh.shape_key_remove(keys["mouthOpen"])

        # Zero all flexes so evaluated mesh is armature-only.
        for kb in list(keys):
            if kb != basis:
                kb.value = 0.0

        depsgraph = bpy.context.evaluated_depsgraph_get()
        eval_obj = mesh.evaluated_get(depsgraph)
        eval_mesh = eval_obj.to_mesh()

        sk = mesh.shape_key_add(name="mouthOpen", from_mix=False)
        if len(sk.data) != len(eval_mesh.vertices):
            eval_obj.to_mesh_clear()
            reports.append(
                {
                    "mesh": mesh.name,
                    "ok": False,
                    "reason": f"vert mismatch {len(sk.data)} vs {len(eval_mesh.vertices)}",
                }
            )
            continue

        max_delta = 0.0
        for i, v in enumerate(eval_mesh.vertices):
            sk.data[i].co = v.co.copy()
            d = (v.co - basis.data[i].co).length
            if d > max_delta:
                max_delta = d

        eval_obj.to_mesh_clear()
        sk.value = 0.0
        reports.append(
            {
                "mesh": mesh.name,
                "ok": True,
                "basis": basis.name,
                "verts": len(sk.data),
                "max_delta": round(max_delta, 5),
            }
        )
    return reports


def reset_pose(arm) -> None:
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    bpy.ops.pose.select_all(action="SELECT")
    bpy.ops.pose.transforms_clear()
    bpy.ops.object.mode_set(mode="OBJECT")


def export_glb(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(path).replace("\\", "/"),
        export_format="GLB",
        use_selection=False,
        export_animations=False,
        export_morph=True,
        export_skins=True,
        export_apply=False,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
    )


def main() -> None:
    clear_scene()
    load_model()
    arm = find_armature()
    meshes = find_meshes()
    moved = pose_mouth_open(arm)
    bake = bake_mouth_open_on_meshes(meshes)
    reset_pose(arm)

    export_glb(OUT_GLB)
    # Promote to active runtime path (v1 remains in archived/v1)
    export_glb(OUT_ACTIVE)

    report = {
        "posed_bones": moved,
        "bake": bake,
        "out_glb": str(OUT_GLB),
        "out_active": str(OUT_ACTIVE),
        "ok_meshes": sum(1 for b in bake if b.get("ok") and b.get("max_delta", 0) > 0.001),
    }
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if report["ok_meshes"] < 1:
        raise RuntimeError("mouthOpen bake produced no meaningful deltas")


if __name__ == "__main__":
    main()
