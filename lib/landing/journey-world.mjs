import * as THREE from "three";
import { createStadium } from "./stadium-model.mjs";
import { createTicket } from "./ticket-model.mjs";
import { createSportsCar } from "./car-model.mjs";
import { createHotel } from "./hotel-model.mjs";
import { material, mesh, box, beam, batchStatic } from "./model-utils.mjs";
import { applyMonochrome } from "./monochrome.mjs";

export function createJourneyWorld() {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color("#172a36");
  scene.fog=new THREE.FogExp2("#172a36",0.0032);
  scene.add(new THREE.HemisphereLight("#d0e6fa","#8b7761",2.1));
  const sun=new THREE.DirectionalLight("#ffe0b0",3.2);
  sun.position.set(-40,100,60); sun.target.position.set(-60,0,0);
  sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-145,right:145,top:95,bottom:-95,near:1,far:260});
  sun.shadow.bias=-0.0002; sun.shadow.normalBias=0.04;
  scene.add(sun,sun.target);
  const {stadium,seatOrigin,focalSeat,neighbors}=createStadium(scene);
  const {ticketGroup,ticketPlane}=createTicket(stadium,seatOrigin);
  const hotel=createHotel(scene);
  const infrastructure=new THREE.Group(); scene.add(infrastructure);
  const ground=mesh(infrastructure,new THREE.PlaneGeometry(650,460),material("#2b3b40",0.98),[-55,-0.12,0]);
  ground.rotation.x=-Math.PI/2;
  ground.castShadow=false;
  const roadCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-48,0.12,0),new THREE.Vector3(-68,0.12,-5),
    new THREE.Vector3(-95,0.12,-12),new THREE.Vector3(-130,0.12,-12),new THREE.Vector3(-149,0.12,-20),
  ]);
  const roadVertices=[];
  const roadPoint=(t,offset)=>{
    const p=roadCurve.getPointAt(t), tangent=roadCurve.getTangentAt(t);
    return p.add(new THREE.Vector3(-tangent.z,0,tangent.x).multiplyScalar(offset));
  };
  const markings=new THREE.MeshBasicMaterial({color:"#dbd6c3"});
  const asphalt=material("#242a2d",0.99), steel=material("#697780",0.35,0.7);
  const lamps=new THREE.MeshStandardMaterial({color:"#ffe6b0",emissive:"#ffce88",emissiveIntensity:3});
  for(let i=0;i<160;i++){
    const a=roadPoint(i/160,-4),b=roadPoint(i/160,4),c=roadPoint((i+1)/160,4),d=roadPoint((i+1)/160,-4);
    roadVertices.push(...a,...b,...c,...a,...c,...d);
    if(i%8===0){
      const p=roadCurve.getPointAt(i/160);
      const dash=box(infrastructure,[1.5,0.015,0.09],[p.x,p.y+0.018,p.z],markings);
      const tangent=roadCurve.getTangentAt(i/160);dash.rotation.y=-Math.atan2(tangent.z,tangent.x);
    }
    if(i%20===0){
      const p=roadPoint(i/160,4.5);
      beam(infrastructure,[p.x,0,p.z],[p.x,5.7,p.z],0.065,steel);
      box(infrastructure,[1.3,0.1,0.4],[p.x,5.7,p.z],lamps);
    }
  }
  const roadGeometry=new THREE.BufferGeometry();
  roadGeometry.setAttribute("position",new THREE.Float32BufferAttribute(roadVertices,3));roadGeometry.computeVertexNormals();
  asphalt.side=THREE.DoubleSide;mesh(infrastructure,roadGeometry,asphalt);
  for(const side of [-1,1]){
    const points=Array.from({length:121},(_,i)=>roadPoint(i/120,side*3.85).add(new THREE.Vector3(0,0.025,0)));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:"#e3d6b6"}));
    infrastructure.add(line);
  }
  const city=material("#4c6069",0.85), windows=material("#233b49",0.3,0.3);
  for(let i=0;i<18;i++){
    const height=9+(i*13%25),x=-190+i*14,z=i%2?-86:79;
    box(infrastructure,[9,height,12],[x,height/2,z],city);
    for(let level=3;level<height;level+=4)box(infrastructure,[8,1.8,0.1],[x,level,z+(i%2?6.01:-6.01)],windows);
  }
  batchStatic(infrastructure);
  const {carGroup,wheels}=createSportsCar(scene);
  // A soft contact patch anchors the moving coupe even at lower shadow quality.
  const contact=mesh(carGroup,new THREE.CircleGeometry(1,32),
    new THREE.MeshBasicMaterial({color:"#000000",transparent:true,opacity:0.24,depthWrite:false}),[0,0.015,0]);
  contact.name="Car contact shadow";
  contact.rotation.x=-Math.PI/2;contact.scale.set(2.7,1.15,1);contact.castShadow=false;

  applyMonochrome(scene,focalSeat,{stadium,hotel,infrastructure,ticketGroup});

  function dispose(){
    const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(object=>{
      if(object.geometry)geometries.add(object.geometry);
      for(const mat of [object.material].flat().filter(Boolean)){
        materials.add(mat);
        for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);
      }
      if(object.isInstancedMesh)object.dispose();
      if(object.isLight&&object.shadow)object.shadow.dispose();
    });
    textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  }
  return {scene,sun,stadium,hotel,seatOrigin,focalSeat,neighbors,ticketGroup,ticketPlane,carGroup,wheels,roadCurve,dispose};
}
