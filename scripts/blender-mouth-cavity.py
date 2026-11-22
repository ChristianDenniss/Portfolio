"""
Cut a real oral cavity into Cortana's face and author mouthOpen.

  blender --background --python scripts/blender-mouth-cavity.py
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

ROOT = Path(r"c:\Users\aottg\development\personal\projectPortfolio")
SRC = ROOT / "public" / "models" / "auntie-dot.pre-mouth.glb"
OUT_GLB = ROOT / "public" / "models" / "auntie-dot.mouth-cut.glb"
OUT_BLEND = ROOT / "public" / "models" / "auntie-dot.mouth-cut.blend"
REPORT = ROOT / "scripts" / "blender-mouth-report.json"


def clear_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)


def find_face_object():
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        name = (obj.name or "").lower()
        mats = " ".join((m.name if m else "") for m in (obj.data.materials or []))
        if "face" in name or "face" in mats.lower():
            return obj
    return None


def ensure_dark_cavity_material():
    mat = bpy.data.materials.get("cortanaMouthCavity")
    if mat is None:
        mat = bpy.data.materials.new("cortanaMouthCavity")
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (0.01, 0.015, 0.025, 1.0)
    bsdf.inputs["Roughness"].default_value = 1.0
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = 0.0
    if "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = (0.0, 0.0, 0.0, 1.0)
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = 0.0
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def main() -> int:
    clear_scene()
    bpy.ops.import_scene.gltf(filepath=str(SRC))

    face = find_face_object()
    if face is None:
        print("ERROR: face mesh not found")
        return 1

    bpy.ops.object.select_all(action="DESELECT")
    face.select_set(True)
    bpy.context.view_layer.objects.active = face
    if face.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")

    me = face.data
    if me.shape_keys:
        face.shape_key_clear()

    # Use WORLD positions for lip selection — armature parents scale/orient local verts.
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    bm.normal_update()
    face.matrix_world = face.matrix_world  # ensure fresh
    mw = face.matrix_world.copy()

    wcos = [mw @ v.co for v in bm.verts]
    min_w = Vector((min(c.x for c in wcos), min(c.y for c in wcos), min(c.z for c in wcos)))
    max_w = Vector((max(c.x for c in wcos), max(c.y for c in wcos), max(c.z for c in wcos)))
    size_w = max_w - min_w
    mid_x = (min_w.x + max_w.x) * 0.5

    # After glTF→Blender: Z-up. Head height = Z, forward ≈ −Y for this Mixamo bust.
    h_size = size_w.z
    d_size = size_w.y
    lip_h = min_w.z + h_size * 0.42
    front_y = min_w.y  # more negative / smaller = front of face

    def score_face(f) -> float | None:
        ws = [mw @ v.co for v in f.verts]
        cx = sum(v.x for v in ws) / len(ws)
        cy = sum(v.y for v in ws) / len(ws)
        cz = sum(v.z for v in ws) / len(ws)
        nx = (cx - mid_x) / max(size_w.x * 0.5, 1e-6)
        nh = (cz - min_w.z) / max(h_size, 1e-6)
        nd = (cy - front_y) / max(d_size, 1e-6)
        if abs(nx) > 0.5:
            return None
        if not (0.35 <= nh <= 0.5):
            return None
        if nd > 0.2:
            return None
        return abs(nh - 0.42) + nd * 2.0 + abs(nx) * 0.3

    ranked = []
    for f in bm.faces:
        s = score_face(f)
        if s is not None:
            ranked.append((s, f))
    ranked.sort(key=lambda t: t[0])
    mouth_faces = [f for _, f in ranked[: max(20, min(60, len(ranked)))]]

    report = {
        "face": face.name,
        "vertsBefore": len(bm.verts),
        "facesBefore": len(bm.faces),
        "worldAabbSize": [round(size_w.x, 4), round(size_w.y, 4), round(size_w.z, 4)],
        "lipH": lip_h,
        "frontY": front_y,
        "mouthFaceCandidates": len(ranked),
        "mouthFacesDeleted": len(mouth_faces),
    }
    if len(mouth_faces) < 4:
        bm.free()
        REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print("ERROR: too few mouth faces", json.dumps(report))
        return 2

    # Tag verts that belong to the seal patch so we only extrude THAT hole.
    for v in bm.verts:
        v.tag = False
    for f in mouth_faces:
        for v in f.verts:
            v.tag = True

    bmesh.ops.delete(bm, geom=mouth_faces, context="FACES")
    bm.edges.ensure_lookup_table()
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()

    hole_edges = [
        e
        for e in bm.edges
        if e.is_boundary and (e.verts[0].tag or e.verts[1].tag)
    ]
    report["holeBoundaryEdges"] = len(hole_edges)
    if len(hole_edges) < 3:
        bm.to_mesh(me)
        bm.free()
        REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print("ERROR: hole boundary missing", json.dumps(report))
        return 3

    geom = bmesh.ops.extrude_edge_only(bm, edges=hole_edges)
    extruded_verts = [e for e in geom["geom"] if isinstance(e, bmesh.types.BMVert)]

    # Move extruded ring into the head in LOCAL space.
    # World: into head ≈ +Y (away from front) and slightly toward lip height on Z.
    inv = mw.inverted()
    # Pull extruded ring toward a point inside the head so walls form a funnel
    # (not a flat patch that fills the hole face-on).
    pocket = Vector((mid_x, front_y + d_size * 0.28, lip_h))
    for v in extruded_verts:
        w = mw @ v.co
        w = w.lerp(pocket, 0.7)
        v.co = inv @ w

    bm.faces.ensure_lookup_table()
    ext_set = set(extruded_verts)
    cavity_faces = [f for f in bm.faces if sum(1 for v in f.verts if v in ext_set) >= 2]
    report["cavityFaces"] = len(cavity_faces)

    cavity_mat = ensure_dark_cavity_material()
    if cavity_mat.name not in [m.name for m in me.materials if m]:
        me.materials.append(cavity_mat)
    cavity_slot = next(i for i, m in enumerate(me.materials) if m and m.name == cavity_mat.name)
    for f in cavity_faces:
        f.material_index = cavity_slot

    bm.to_mesh(me)
    bm.free()
    me.update()

    # Shape keys in LOCAL space, deltas derived from world intent.
    face.shape_key_add(name="Basis", from_mix=False)
    face.shape_key_add(name="mouthOpen", from_mix=False)
    sk_basis = me.shape_keys.key_blocks["Basis"]
    sk_open = me.shape_keys.key_blocks["mouthOpen"]

    lip_half = h_size * 0.09
    chin_h = min_w.z + h_size * 0.2
    lip_open = h_size * 0.16
    jaw_drop = h_size * 0.09
    back = d_size * 0.06
    affected = 0

    for i, v in enumerate(me.vertices):
        w = mw @ v.co
        nx = (w.x - mid_x) / max(size_w.x * 0.5, 1e-6)
        nh = (w.z - min_w.z) / max(h_size, 1e-6)
        nd = (w.y - front_y) / max(d_size, 1e-6)
        if abs(nx) > 0.75 or nd > 0.4 or nh < 0.18 or nh > 0.55:
            continue
        lateral = math.exp(-nx * nx * 1.7)
        depth = math.exp(-nd * nd * 5.5)
        lip_w = math.exp(-((w.z - lip_h) / lip_half) ** 2 * 0.5) * lateral * depth
        jaw_w = 0.0
        if w.z < lip_h:
            t = (lip_h - w.z) / max(lip_h - chin_h, 1e-6)
            jaw_w = max(0.0, 1.0 - t * 0.85) * math.exp(-nx * nx * 1.1) * math.exp(-nd * nd * 3.5)
        if max(lip_w, jaw_w * 0.65) < 0.03:
            continue
        is_upper = w.z >= lip_h
        if is_upper:
            dw = Vector((0.0, back * lip_w * 0.35, lip_open * lip_w * 0.95))
        else:
            dw = Vector(
                (
                    0.0,
                    back * (lip_w * 0.8 + jaw_w * 0.4),
                    -lip_open * lip_w - jaw_drop * jaw_w,
                )
            )
        # world delta → local
        local_delta = inv.to_3x3() @ dw
        sk_open.data[i].co = sk_basis.data[i].co + local_delta
        affected += 1

    sk_open.value = 0.0
    report["shapeKeyAffected"] = affected
    report["vertsAfter"] = len(me.vertices)
    report["facesAfter"] = len(me.polygons)
    report["shapeKeys"] = [kb.name for kb in me.shape_keys.key_blocks]
    REPORT.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

    bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=str(OUT_GLB),
        export_format="GLB",
        use_selection=False,
        export_animations=True,
        export_morph=True,
        export_morph_animation=False,
        export_skins=True,
        export_apply=False,
        export_yup=True,
        export_extras=True,
    )
    print("Wrote", OUT_GLB)
    return 0


if __name__ == "__main__":
    sys.exit(main())
