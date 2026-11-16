"""
Import Garry's Mod Cortana3DrigV2 (Source MDL) via SourceIO and export a GLB.

  blender --background --python scripts/blender-import-cortana-gmod.py

Preserves shape keys (Source flexes) + armature. Does not replace auntie-dot.glb.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import bpy
import addon_utils

ROOT = Path(r"c:\Users\aottg\development\personal\projectPortfolio")
CONTENT = ROOT / "assets" / "cortana3d-rig-v2"
MDL = CONTENT / "models" / "cortana" / "cortana.mdl"
OUT_DIR = ROOT / "public" / "models" / "candidates"
OUT_GLB = OUT_DIR / "cortana-gmod-rig-v2.glb"
OUT_BLEND = OUT_DIR / "cortana-gmod-rig-v2.blend"
REPORT = ROOT / "scripts" / "cortana-gmod-import-report.json"


def enable_sourceio() -> None:
    # Ensure addon is enabled for this Blender session.
    mod = "SourceIO"
    loaded = {m.__name__ for m in addon_utils.modules()}
    if mod not in loaded:
        raise RuntimeError(
            f"{mod} not found under Blender addons. Expected junction in "
            r"%APPDATA%\Blender Foundation\Blender\4.5\scripts\addons\SourceIO"
        )
    addon_utils.enable(mod, default_set=True, persistent=True)
    # Force register if enable was a no-op in background mode
    try:
        import SourceIO  # noqa: F401
        from SourceIO.blender_bindings.bindings import register

        register()
    except Exception as exc:  # pragma: no cover
        print(f"[cortana-gmod] SourceIO register note: {exc}")


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_mdl() -> None:
    if not MDL.is_file():
        raise FileNotFoundError(MDL)

    directory = str(MDL.parent).replace("\\", "/") + "/"
    # Prefer content root for material discovery; also pass mdl directory.
    # SourceIO scans upward/sideways from the file directory when discover_resources=True.
    print(f"[cortana-gmod] Importing {MDL}")
    result = bpy.ops.sourceio.mdl(
        filepath=str(MDL).replace("\\", "/"),
        directory=directory,
        files=[{"name": MDL.name}],
        discover_resources=True,
        import_textures=True,
        import_physics=False,
        import_animations=False,
        # Drivers crash on this MDL's stereo flex rules; shape keys still import.
        create_flex_drivers=False,
        use_bvlg=False,
        bodygroup_grouping=True,
        scale=0.0254,  # SourceIO default hammer→meters; keep human scale
    )
    print(f"[cortana-gmod] import result: {result}")
    if "FINISHED" not in result:
        raise RuntimeError(f"MDL import failed: {result}")


def collect_report() -> dict:
    meshes = []
    armatures = []
    flex_names: set[str] = set()
    bone_names: list[str] = []

    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            names = [b.name for b in obj.data.bones]
            armatures.append({"name": obj.name, "bones": len(names)})
            bone_names.extend(names)
        if obj.type == "MESH":
            keys = []
            if obj.data.shape_keys and obj.data.shape_keys.key_blocks:
                keys = [kb.name for kb in obj.data.shape_keys.key_blocks]
                flex_names.update(keys)
            meshes.append(
                {
                    "name": obj.name,
                    "verts": len(obj.data.vertices),
                    "shape_keys": keys,
                    "materials": [m.name if m else None for m in (obj.data.materials or [])],
                }
            )

    face_ish = sorted(
        n
        for n in (list(flex_names) + bone_names)
        if any(
            t in n.lower()
            for t in (
                "jaw",
                "mouth",
                "lip",
                "tongue",
                "teeth",
                "blink",
                "phoneme",
                "cheek",
                "eye",
            )
        )
    )

    return {
        "mdl": str(MDL),
        "out_glb": str(OUT_GLB),
        "mesh_count": len(meshes),
        "armature_count": len(armatures),
        "meshes": meshes,
        "armatures": armatures,
        "face_controls": face_ish,
        "shape_key_total": len(flex_names),
    }


def export_glb() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND).replace("\\", "/"))

    # Select everything for export
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(OUT_GLB).replace("\\", "/"),
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
    print(f"[cortana-gmod] Wrote {OUT_GLB}")


def main() -> int:
    clear_scene()
    enable_sourceio()
    import_mdl()
    report = collect_report()
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("[cortana-gmod] report:", json.dumps(report, indent=2))
    export_glb()
    print(f"[cortana-gmod] blend: {OUT_BLEND}")
    print(f"[cortana-gmod] glb:   {OUT_GLB} ({OUT_GLB.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"[cortana-gmod] FAILED: {exc}", file=sys.stderr)
        raise
