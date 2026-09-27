import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Bake static architecture into one draw call per material/attribute layout.
// Animated objects and instanced seats are deliberately left separate.
export function batchStatic(group) {
  group.updateMatrixWorld(true);
  const inverse = group.matrixWorld.clone().invert(), batches = new Map(), removed = new Set();
  group.traverse(object => {
    if (!object.isMesh || object.isInstancedMesh || Array.isArray(object.material)) return;
    const key = object.material.uuid + Object.keys(object.geometry.attributes).sort().join();
    if (!batches.has(key)) batches.set(key, {material:object.material,parts:[],objects:[]});
    const entry=batches.get(key);
    let geometry=object.geometry.clone().applyMatrix4(inverse.clone().multiply(object.matrixWorld));
    if(geometry.index){ const plain=geometry.toNonIndexed(); geometry.dispose(); geometry=plain; }
    entry.parts.push(geometry); entry.objects.push(object);
  });
  for(const entry of batches.values()) {
    const merged=mergeGeometries(entry.parts);
    entry.parts.forEach(geometry=>geometry.dispose());
    if(!merged) continue;
    entry.objects.forEach(object=>{removed.add(object.geometry);object.removeFromParent();});
    mesh(group,merged,entry.material);
  }
  removed.forEach(geometry=>geometry.dispose());
}

export const material = (color, roughness = 0.65, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
export function mesh(group, geometry, mat, position = [0, 0, 0]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.castShadow = true;
  object.receiveShadow = true;
  group.add(object);
  return object;
}
export function box(group, size, position, mat, radius = 0) {
  return mesh(group, radius ? new RoundedBoxGeometry(...size, 2, radius) : new THREE.BoxGeometry(...size), mat, position);
}
export function beam(group, a, b, radius, mat) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const object = mesh(group, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 6), mat);
  object.position.copy(start).add(end).multiplyScalar(0.5);
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  return object;
}
export function ring(group, rx, rz, y, width, mat) {
  const shape = new THREE.Shape();
  shape.absellipse(0, 0, rx, rz, 0, Math.PI * 2, false, 0);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, rx - width, rz - width, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  const object = mesh(group, new THREE.ShapeGeometry(shape, 128), mat, [0, y, 0]);
  object.rotation.x = -Math.PI / 2;
  return object;
}
export function textPanel(group, text, size, position, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = "#f4f4f4";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = `600 ${options.fontSize || 78}px sans-serif`;
    ctx.fillText(text, 512, 128, 970);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const object = mesh(group, new THREE.PlaneGeometry(...size),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }), position);
  return object;
}
