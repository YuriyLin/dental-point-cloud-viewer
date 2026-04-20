import * as fs from 'fs';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const buffer = fs.readFileSync('/home/yuxuan/3DTeethSegmetation/Pointcept/results/1ea742cd-b185-49e7-b741-d2bd7722f2a5_mesh_original_mesh.ply');
const loader = new PLYLoader();
const geometry = loader.parse( buffer.buffer );

console.log("Vert 0:", geometry.attributes.position.array[0], geometry.attributes.position.array[1], geometry.attributes.position.array[2]);
console.log("Vert 1:", geometry.attributes.position.array[3], geometry.attributes.position.array[4], geometry.attributes.position.array[5]);
console.log("Vert 2:", geometry.attributes.position.array[6], geometry.attributes.position.array[7], geometry.attributes.position.array[8]);
