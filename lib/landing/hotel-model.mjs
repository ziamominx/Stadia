import * as THREE from "three";
import { material, mesh, box, beam, textPanel, batchStatic } from "./model-utils.mjs";

export function createHotel(scene) {
  const hotel=new THREE.Group(); hotel.position.set(-150,0,-45); hotel.name="Stadia House hotel"; scene.add(hotel);
  const stone=material("#d1c8b4",0.87), dark=material("#263339",0.48,0.4);
  const brass=material("#b39762",0.28,0.7), wood=material("#765441",0.72);
  const glass=new THREE.MeshPhysicalMaterial({color:"#557d89",metalness:0.45,roughness:0.16,clearcoat:1});
  const warm=new THREE.MeshStandardMaterial({color:"#e3c28c",emissive:"#dfb673",emissiveIntensity:0.45,roughness:0.6});
  box(hotel,[38,0.3,38],[0,0,9],stone);
  box(hotel,[24,0.28,18],[0,0.4,0],stone);
  box(hotel,[24,0.5,18],[0,7,0],stone);
  // Lobby is open behind glass, with a desk, seating, planters and ceiling pendants.
  box(hotel,[23,6.2,0.4],[0,3.6,-8.8],wood);
  box(hotel,[8,1.4,1.6],[1,1.2,-4],stone,0.12);
  box(hotel,[8.4,0.12,1.8],[1,1.95,-4],dark,0.05);
  textPanel(hotel,"STADIA HOUSE",[6,1.1],[1,4.7,-8.5],{background:"#765441",color:"#f0d2a0",fontSize:85});
  for(const x of [-10,-5,5,10]) beam(hotel,[x,0.5,8.5],[x,6.8,8.5],0.13,brass);
  const lobbyGlass=new THREE.MeshPhysicalMaterial({color:"#a1c5cc",roughness:0.1,metalness:0.1,transparent:true,opacity:0.22,depthWrite:false,side:THREE.DoubleSide});
  for(const x of [-9,-6,6,9])box(hotel,[2.8,6,0.05],[x,3.7,8.9],lobbyGlass);
  for(const x of [-7,7])for(const z of [0,3]){
    box(hotel,[1.6,0.5,1.5],[x,0.9,z],wood,0.15);
    box(hotel,[1.6,0.8,0.25],[x,1.5,z-.6],wood,0.10);
  }
  for(const x of [-7,0,7]) {
    beam(hotel,[x,6.9,2],[x,5,2],0.025,brass);
    mesh(hotel,new THREE.SphereGeometry(0.35,12,8),warm,[x,5,2]);
  }
  // Repeated windows and projecting floor slabs give all four façades depth.
  box(hotel,[18,24,14],[0,19,-2],stone);
  for(let floor=0;floor<6;floor++){
    const y=9+floor*4;
    box(hotel,[19,0.3,15],[0,y+2,-2],stone);
    for(let col=0;col<6;col++){
      const x=-7.5+col*3;
      for(const z of [5.08,-9.08]) {
        const mat=(floor*7+col)%4===0?warm:glass;
        box(hotel,[2.4,2.7,0.09],[x,y,z],mat);
        box(hotel,[0.08,2.85,0.18],[x,y,z],brass);
        box(hotel,[2.55,0.1,0.65],[x,y-1.42,z],stone);
      }
    }
    for(const x of [-9.08,9.08])for(let col=0;col<4;col++){
      const z=-7+col*3.2;
      box(hotel,[0.09,2.7,2.55],[x,y,z],(col+floor)%3===0?warm:glass);
      box(hotel,[0.18,2.85,0.08],[x,y,z],brass);
    }
  }
  box(hotel,[23,0.5,15],[1,32,-2],stone);
  box(hotel,[17,3.6,10],[1,34,-2],glass);
  box(hotel,[24,0.4,16],[1,36,-2],stone);
  // Rooftop pool, lounge deck and perimeter glass railing.
  box(hotel,[10,0.25,4.5],[5,36.35,1],stone);
  const water=new THREE.MeshPhysicalMaterial({color:"#2c9ba2",roughness:0.12,metalness:0.4,clearcoat:1});
  box(hotel,[9.5,0.04,4],[5,36.51,1],water);
  for(let i=0;i<4;i++)box(hotel,[0.7,0.18,1.8],[-7+i*1.8,36.4,1],wood,0.06);
  for(const z of [-9.5,5.5])box(hotel,[23,1,0.05],[1,36.7,z],lobbyGlass);
  // Porte-cochère, signage, entrance steps and bollards.
  box(hotel,[15,0.6,12],[0,5.4,14],dark);
  box(hotel,[14.5,0.08,11.5],[0,5.05,14],warm);
  for(const x of [-6,6])for(const z of [10,18])beam(hotel,[x,0.4,z],[x,5.2,z],0.18,brass);
  textPanel(hotel,"STADIA HOUSE",[10,1],[0,5.5,20.05],{background:"#263339",fontSize:86});
  for(let i=0;i<3;i++)box(hotel,[12,0.12,1],[0,0.18+i*0.12,10-i],stone);
  for(const x of [-8,8])for(const z of [14,18,22]){
    beam(hotel,[x,0.3,z],[x,1.1,z],0.08,dark);
    mesh(hotel,new THREE.SphereGeometry(0.10,8,6),warm,[x,1.1,z]);
  }
  const foliage=material("#355947",0.95);
  for(const x of [-14,14])for(const z of [-3,6,15,24]){
    box(hotel,[3,0.7,3],[x,0.5,z],stone,0.1);
    beam(hotel,[x,0.8,z],[x,4.7,z],0.12,wood);
    const crown=mesh(hotel,new THREE.IcosahedronGeometry(1.5,1),foliage,[x,4.8,z]); crown.scale.y=1.6;
  }
  batchStatic(hotel);
  return hotel;
}
