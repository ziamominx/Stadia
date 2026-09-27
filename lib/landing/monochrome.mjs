import * as THREE from "three";

// Retain the depth and occlusion of the finished models while rendering their
// silhouette and structural edges like a white architectural drawing.
function combineStaticOutlines(root, excluded = []) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const groups = new Map();
  const originals = [];
  root.traverse(object => {
    if (object.name !== "Architectural outline") return;
    let parent = object.parent;
    while (parent && parent !== root) {
      if (excluded.includes(parent)) return;
      parent = parent.parent;
    }
    const opacity = object.material.opacity;
    if (!groups.has(opacity)) groups.set(opacity, []);
    groups.get(opacity).push(object);
    originals.push(object);
  });
  for (const [opacity, outlines] of groups) {
    const count = outlines.reduce((sum, object) => sum + object.geometry.attributes.position.count, 0);
    const points = new Float32Array(count * 3);
    const point = new THREE.Vector3();
    let offset = 0;
    for (const object of outlines) {
      const position = object.geometry.attributes.position;
      const transform = inverse.clone().multiply(object.matrixWorld);
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i).applyMatrix4(transform);
        points[offset++] = point.x; points[offset++] = point.y; points[offset++] = point.z;
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const lines = new THREE.LineSegments(geometry,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity,
        depthWrite: false }));
    lines.name = "Combined architectural outlines";
    root.add(lines);
  }
  originals.forEach(object => {
    object.removeFromParent(); object.geometry.dispose(); object.material.dispose();
  });
}

export function applyMonochrome(scene, focalSeat, { stadium, hotel, infrastructure, ticketGroup }) {
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.0026);
  const oldMaterials = new Set();
  const objects = [];
  scene.traverse(object => {
    if (object.isLine && object.material?.color) object.material.color.set(0xffffff);
    if (!object.isMesh) return;
    objects.push(object);
    for (const material of [object.material].flat().filter(Boolean)) oldMaterials.add(material);
  });
  for (const object of objects) {
    object.castShadow = false;
    object.receiveShadow = false;
    if (object.name === "Car contact shadow") continue;
    if (object.isInstancedMesh) {
      object.material = new THREE.MeshBasicMaterial({
        color: 0xffffff, wireframe: true, transparent: true, opacity: 0.62,
        depthWrite: false,
      });
      continue;
    }
    if (!object.material?.map) {
      object.material = new THREE.MeshBasicMaterial({
        color: 0x050505, side: object.material?.side ?? THREE.FrontSide,
        polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
      });
    }
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(object.geometry, 22),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true,
        opacity: 0.68, depthWrite: false }),
    );
    edge.name = "Architectural outline";
    object.add(edge);
  }
  focalSeat.traverse(object => {
    if (object.name === "Architectural outline") object.material.opacity = 1;
  });
  combineStaticOutlines(stadium, [ticketGroup]);
  combineStaticOutlines(hotel);
  combineStaticOutlines(infrastructure);
  const current = new Set(objects.map(object => object.material));
  oldMaterials.forEach(material => { if (!current.has(material)) material.dispose(); });
}
