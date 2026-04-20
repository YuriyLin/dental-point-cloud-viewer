import sys
import os
import json
import trimesh

sys.path.insert(0, '/home/yuxuan/3DTeethSegmetation/Pointcept')
from api_server import extract_face_labels

def main():
    ply_path = '/home/yuxuan/3DTeethSegmetation/Pointcept/results/000588maxilla_upper_0225_151655_original_mesh.ply'
    meta_path = '/home/yuxuan/3DTeethSegmetation/Pointcept/results/000588maxilla_upper_0225_151655_metadata.json'
    out_ply = '/home/yuxuan/3DTeethSegmetation/AI-Dental-3D-Segmentation-DEMO/public/sample_mesh.ply'
    out_json = '/home/yuxuan/3DTeethSegmetation/AI-Dental-3D-Segmentation-DEMO/public/sample_labels.json'
    
    # 1. Copy PLY
    os.system(f"cp {ply_path} {out_ply}")
    
    # 2. Generate JSON face labels
    mesh = trimesh.load(ply_path)
    with open(meta_path, 'r') as f:
        meta = json.load(f)
        
    color_to_fdi = {}
    for class_val_str, fdi_val in meta.get('class_to_fdi', {}).items():
        for color_str, cls_ in meta.get('color_to_class', {}).items():
            if str(cls_) == class_val_str:
                color_to_fdi[color_str] = int(fdi_val)
                
    face_labels = extract_face_labels(mesh, color_to_fdi)
    with open(out_json, 'w') as f:
        json.dump({"upper_seg_label": face_labels}, f)
        
    print(f"Generated test data: {out_ply} and {out_json}")

if __name__ == '__main__':
    main()
