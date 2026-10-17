"""Create a small frontend fixture from an API-generated labeled PLY."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

import trimesh


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--core-root", type=Path, required=True, help="Path to the dental-point-cloud-segmentation repository")
    parser.add_argument("--input-ply", type=Path, required=True, help="Labeled PLY exported by the API")
    parser.add_argument("--metadata", type=Path, required=True, help="Metadata JSON exported by the API")
    parser.add_argument("--output-ply", type=Path, default=Path("public/sample_mesh.ply"))
    parser.add_argument("--output-json", type=Path, default=Path("public/sample_labels.json"))
    args = parser.parse_args()

    sys.path.insert(0, str(args.core_root / "Pointcept"))
    from tools.api_server import extract_face_labels

    args.output_ply.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(args.input_ply, args.output_ply)

    mesh = trimesh.load(str(args.input_ply))
    with args.metadata.open("r", encoding="utf-8") as file:
        metadata = json.load(file)

    color_to_fdi = {}
    for class_value, fdi_value in metadata.get("class_to_fdi", {}).items():
        for color, class_id in metadata.get("color_to_class", {}).items():
            if str(class_id) == str(class_value):
                color_to_fdi[color] = int(fdi_value)

    face_labels = extract_face_labels(mesh, color_to_fdi)
    with args.output_json.open("w", encoding="utf-8") as file:
        json.dump({"upper_seg_label": face_labels}, file)

    print(f"Generated test data: {args.output_ply} and {args.output_json}")


if __name__ == "__main__":
    main()
