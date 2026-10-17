import * as fs from 'fs';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error('Usage: node parse_ply.mjs <path-to-ply>');
}

const buffer = fs.readFileSync(inputPath);
const loader = new PLYLoader();
const geometry = loader.parse( buffer.buffer );

console.log("Vert 0:", geometry.attributes.position.array[0], geometry.attributes.position.array[1], geometry.attributes.position.array[2]);
console.log("Vert 1:", geometry.attributes.position.array[3], geometry.attributes.position.array[4], geometry.attributes.position.array[5]);
console.log("Vert 2:", geometry.attributes.position.array[6], geometry.attributes.position.array[7], geometry.attributes.position.array[8]);
