import * as THREE from "three";
import { material, mesh, box, beam } from "./model-utils.mjs";

// Original unbranded coupe, modeled in the same scale as the roadway.
export function createSportsCar(parent) {
  const group=new THREE.Group(); group.name="Detailed sports coupe"; parent.add(group);
  const paint=new THREE.MeshPhysicalMaterial({color:"#cf693e",roughness:0.24,metalness:0.65,clearcoat:1,clearcoatRoughness:0.12});
  const trim=material("#11191e",0.4,0.45), rubber=material("#171a1e",0.98);
  const alloy=material("#d2d9dc",0.22,0.85);
  const glass=new THREE.MeshPhysicalMaterial({color:"#314c59",roughness:0.1,metalness:0.3,clearcoat:1});
  glass.transparent=true; glass.opacity=0.78; glass.depthWrite=false;
  // Cross sections create a tapered nose, flared shoulders and rear haunches.
  const sections=[[-2.55,0.60,0.65],[-2.2,0.91,0.88],[-1.35,1.04,0.95],[0,1.02,0.89],[1.35,1.12,0.92],[2.25,0.96,0.87],[2.5,0.74,0.72]];
  const vertices=[];
  const cross=(section)=>{const[x,w,h]=section;return [[x,0.36,-w*.82],[x,h*.85,-w],[x,h,-w*.70],[x,h,w*.70],[x,h*.85,w],[x,0.36,w*.82]];};
  for(let i=0;i<sections.length-1;i++) {
    const a=cross(sections[i]),b=cross(sections[i+1]);
    for(let j=0;j<6;j++){const k=(j+1)%6; vertices.push(...a[j],...b[j],...b[k],...a[j],...b[k],...a[k]);}
  }
  for(const i of [0,sections.length-1]){const points=cross(sections[i]); for(let j=1;j<5;j++) vertices.push(...points[0],...points[j],...points[j+1]);}
  const body=new THREE.BufferGeometry(); body.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3)); body.computeVertexNormals();
  paint.side=THREE.DoubleSide; mesh(group,body,paint);
  box(group,[4.65,0.13,1.9],[0,0.32,0],trim,0.05);
  box(group,[1.7,0.12,1.47],[0.35,1.56,0],paint,0.05);
  const panel=(points,mat)=>{
    const geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.Float32BufferAttribute([...points[0],...points[1],...points[2],...points[0],...points[2],...points[3]],3)); geo.computeVertexNormals();
    mat.side=THREE.DoubleSide; return mesh(group,geo,mat);
  };
  panel([[-1.13,0.97,-0.81],[-0.45,1.53,-0.69],[-0.45,1.53,0.69],[-1.13,0.97,0.81]],glass);
  panel([[1.19,1.51,-0.69],[1.68,0.98,-0.80],[1.68,0.98,0.80],[1.19,1.51,0.69]],glass);
  for(const side of [-1,1]){
    panel([[-1.06,0.98,side*0.83],[-0.43,1.51,side*0.72],[1.15,1.51,side*0.72],[1.61,0.98,side*0.83]],glass);
    beam(group,[-0.43,1.53,side*.72],[-1.14,0.97,side*.86],0.04,paint);
    beam(group,[1.16,1.53,side*.72],[1.66,0.97,side*.84],0.04,paint);
    beam(group,[0.45,1.51,side*.74],[0.45,0.96,side*.87],0.023,trim);
    box(group,[0.35,0.12,0.20],[-0.9,1.10,side*1.02],paint,0.045);
    box(group,[0.28,0.035,0.035],[0.65,0.89,side*1.023],alloy,0.01);
    box(group,[0.7,0.12,0.035],[1.1,0.52,side*1.04],trim,0.035);
    box(group,[0.43,0.50,0.42],[0.45,1.0,side*.4],trim,0.08);
  }
  const wheels=[];
  for(const x of [-1.52,1.52])for(const side of [-1,1]){
    const wheel=new THREE.Group(); wheel.position.set(x,0.48,side*1.01); group.add(wheel); wheels.push(wheel);
    mesh(wheel,new THREE.TorusGeometry(0.36,0.13,12,32),rubber);
    const disc=mesh(wheel,new THREE.CylinderGeometry(0.28,0.28,0.08,32),trim); disc.rotation.x=Math.PI/2;
    mesh(wheel,new THREE.TorusGeometry(0.31,0.025,8,32),alloy,[0,0,side*0.10]);
    for(let s=0;s<5;s++){
      const a=s*Math.PI*2/5;
      beam(wheel,[0,0,side*.09],[Math.cos(a)*.31,Math.sin(a)*.31,side*.09],0.025,alloy);
    }
    box(wheel,[0.1,0.24,0.07],[0.17,0,side*0.1],material("#e1472d",0.4,0.2),0.02);
  }
  const headlights=new THREE.MeshStandardMaterial({color:"#f4f7ff",emissive:"#d5e9ff",emissiveIntensity:4});
  const taillights=new THREE.MeshStandardMaterial({color:"#e84837",emissive:"#e32518",emissiveIntensity:2});
  for(const side of [-1,1]){
    box(group,[0.10,0.09,0.55],[-2.42,0.67,side*.46],headlights,0.03);
    box(group,[0.09,0.08,0.6],[2.40,0.67,side*.43],taillights,0.025);
    const exhaust=mesh(group,new THREE.CylinderGeometry(.09,.09,.16,16),alloy,[2.46,.38,side*.57]); exhaust.rotation.z=Math.PI/2;
  }
  box(group,[0.05,0.18,0.85],[-2.5,0.44,0],trim,0.035);
  box(group,[0.6,0.07,1.85],[2,1.04,0],trim,0.025);
  return {carGroup:group,wheels};
}
