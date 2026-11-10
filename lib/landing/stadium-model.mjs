import * as THREE from "three";
import { material, mesh, box, beam, ring, textPanel, batchStatic } from "./model-utils.mjs";

export function createStadium(scene) {
  const stadium = new THREE.Group();
  stadium.name = "Complete tiered cricket stadium";
  scene.add(stadium);
  const concrete = material("#92938d", 0.95);
  const steel = material("#cbd2ce", 0.35, 0.7);
  const dark = material("#20343b", 0.6, 0.3);
  const roof = material("#dce0d5", 0.55, 0.15);
  roof.side = THREE.DoubleSide;
  const boundary = new THREE.MeshBasicMaterial({ color: "#f4ead4" });

  // Solid terrace geometry: each seat rests on a tread, with vertical risers.
  const terraceVertices = [];
  const quad = (a,b,c,d) => terraceVertices.push(...a,...b,...c,...a,...c,...d);
  const rows = [];
  for (let tier = 0; tier < 2; tier++) for (let row = 0; row < (tier ? 16 : 10); row++) {
    const rx = tier ? 37.5 + row * 0.95 : 24 + row * 1.2;
    const rz = tier ? 26.5 + row * 0.73 : 16.2 + row * 0.92;
    const y = tier ? 9 + row * 0.75 : 2.1 + row * 0.7;
    rows.push({rx, rz, y, tier, row});
    for (let s = 0; s < 240; s++) {
      const a = s / 240 * Math.PI * 2, b = (s + 1) / 240 * Math.PI * 2;
      const point = (angle, radial, height) => [Math.cos(angle)*(rx+radial), height, Math.sin(angle)*(rz+radial)];
      quad(point(a,-0.5,y),point(a,0.7,y),point(b,0.7,y),point(b,-0.5,y));
      quad(point(a,-0.5,y-0.75),point(a,-0.5,y),point(b,-0.5,y),point(b,-0.5,y-0.75));
    }
  }
  const terraces = new THREE.BufferGeometry();
  terraces.setAttribute("position",new THREE.Float32BufferAttribute(terraceVertices,3));
  terraces.computeVertexNormals();
  concrete.side = THREE.DoubleSide;
  mesh(stadium, terraces, concrete);

  const positions = [];
  for (const row of rows) {
    const circumference = Math.PI * (3 * (row.rx + row.rz) - Math.sqrt((3*row.rx+row.rz)*(row.rx+3*row.rz)));
    const count = Math.floor(circumference / 0.63);
    for (let col = 0; col < count; col++) {
    if ((col * 12 / count) % 1 < 1.7 * 12 / count) continue; // Twelve radial access aisles.
    const angle = col / count * Math.PI * 2;
    if (!row.tier && row.row === 3 && Math.abs(angle - Math.PI) < 0.09) continue;
    positions.push({ ...row, angle, col });
    }
  }
  const chairMaterial = material("#ffffff", 0.43, 0.07);
  const panGeo = new THREE.BoxGeometry(0.51,0.12,0.50);
  const backGeo = new THREE.BoxGeometry(0.51,0.55,0.09);
  const pans = new THREE.InstancedMesh(panGeo,chairMaterial,positions.length);
  const backs = new THREE.InstancedMesh(backGeo,chairMaterial,positions.length);
  pans.name = "All stadium seat cushions"; backs.name = "All stadium seat backs";
  const dummy = new THREE.Object3D(), color = new THREE.Color();
  const palette = ["#bebebe", "#919191", "#d8d8d8", "#777777"];
  positions.forEach((p,i) => {
    dummy.position.set(Math.cos(p.angle)*p.rx,p.y+0.42,Math.sin(p.angle)*p.rz);
    dummy.rotation.set(0,-p.angle-Math.PI/2,0);
    dummy.updateMatrix(); pans.setMatrixAt(i,dummy.matrix);
    const outward = new THREE.Vector3(Math.cos(p.angle)*0.22,0.3,Math.sin(p.angle)*0.22);
    dummy.position.add(outward); dummy.updateMatrix(); backs.setMatrixAt(i,dummy.matrix);
    color.set(palette[(Math.floor(p.angle / (Math.PI * 2) * 12) + p.tier) % palette.length]);
    pans.setColorAt(i,color); backs.setColorAt(i,color);
  });
  pans.receiveShadow = backs.receiveShadow = true;
  stadium.add(pans,backs);
  stadium.userData.seatCount = positions.length + 3;

  ring(stadium,37,26.5,8,2.4,concrete);
  ring(stadium,52,37.5,21.2,2,concrete);
  // A roof aperture remains above the playing area and camera entry route.
  ring(stadium,56,42,22.8,21,roof);
  for (let i=0;i<48;i++) {
    const a=i/48*Math.PI*2, c=Math.cos(a), s=Math.sin(a);
    beam(stadium,[c*49,0,s*36],[c*50,22.8,s*37],0.16,steel);
    beam(stadium,[c*56,22.8,s*42],[c*34,22.8,s*21],0.14,steel);
    if (i%2===0) beam(stadium,[c*50,19,s*37],[c*35,22.8,s*22],0.09,steel);
  }
  // Perimeter glazing, gates, concourse balustrades and floodlight banks.
  for (let i=0;i<48;i++) {
    const a=i/48*Math.PI*2;
    if (i%4 !== 0) {
      const panel=box(stadium,[5,5.5,0.22],[Math.cos(a)*48,4,Math.sin(a)*35],dark);
      panel.rotation.y=-a-Math.PI/2;
    }
  }
  for (let i=0;i<12;i++) {
    const a=i/12*Math.PI*2;
    for (let step=0;step<22;step++) {
      const row=rows[step];
      // Keep the selected seat bay clear of a stair tread and railing post.
      if(i===6 && step===3) continue;
      const stair=box(stadium,[1.05,0.16,1.0],[Math.cos(a)*row.rx,row.y+0.04,Math.sin(a)*row.rz],concrete);
      stair.rotation.y=-a-Math.PI/2;
      if(step%3===0) beam(stadium,[Math.cos(a)*row.rx,row.y,Math.sin(a)*row.rz],
        [Math.cos(a)*row.rx,row.y+1,Math.sin(a)*row.rz],0.025,steel);
    }
    const label=textPanel(stadium,`STAND ${String(i+1).padStart(2,"0")}`,[3.3,0.65],
      [Math.cos(a)*36.5,8.3,Math.sin(a)*26]);
    label.lookAt(0,8.3,0);
  }
  for (const [x,z] of [[-43,-32],[43,-32],[-43,32],[43,32]]) {
    beam(stadium,[x,0,z],[x,31,z],0.26,steel);
    const bank=box(stadium,[5,1.6,0.4],[x,30,z],dark);
    bank.lookAt(0,12,0);
    const lamps=new THREE.MeshStandardMaterial({color:"#fff4d5",emissive:"#fff4d5",emissiveIntensity:3});
    for(let k=0;k<6;k++) box(bank,[0.6,0.8,0.12],[-2+k*0.8,0,0.28],lamps);
  }

  const turf=material("#397e4b",0.98);
  const field=mesh(stadium,new THREE.CircleGeometry(1,128),turf,[0,0.02,0]);
  field.rotation.x=-Math.PI/2; field.scale.set(22.5,15,1);
  const stripe=material("#468b50",0.98);
  for(let x=-20;x<21;x+=4) {
    const length=2*15*Math.sqrt(Math.max(0,1-(x/22.5)**2));
    box(stadium,[1.9,0.012,length],[x,0.035,0],stripe);
  }
  ring(stadium,22.6,15.1,0.055,0.08,boundary);
  box(stadium,[2.2,0.05,13],[0,0.07,0],material("#c2a572",1));
  for(const z of [-5.8,5.8]) {
    box(stadium,[3,0.012,0.06],[0,0.105,z],boundary);
    for(const x of [-0.16,0,0.16]) beam(stadium,[x,0.1,z],[x,0.7,z],0.025,boundary);
    beam(stadium,[-0.2,0.7,z],[0.2,0.7,z],0.025,boundary);
  }
  textPanel(stadium,"STADIA  /  MATCH DAY",[13,3.2],[0,17,-28],{fontSize:72});
  const gate=textPanel(stadium,"WEST GATE  /  A12",[7,1.2],[-49,6,0]);
  gate.rotation.y=-Math.PI/2;

  batchStatic(stadium);

  const seatOrigin = new THREE.Vector3(-27.5,4.2,0);
  const seats = new THREE.Group(); seats.position.copy(seatOrigin); seats.rotation.y=Math.PI/2; stadium.add(seats);
  const buildSeat = (offset, selected) => {
    const group=new THREE.Group(); group.position.x=offset; seats.add(group);
    const shell=material(selected?"#d59a54":"#246a80",0.32,0.12);
    box(group,[0.69,0.16,0.63],[0,0.43,0.04],shell,0.07);
    const back=box(group,[0.68,0.76,0.15],[0,0.88,-0.22],shell,0.07); back.rotation.x=-0.10;
    for(const x of [-0.36,0.36]) {
      beam(group,[x,0.05,-0.12],[x,0.66,-0.12],0.035,dark);
      box(group,[0.08,0.06,0.52],[x,0.68,0.04],dark,0.025);
      const cup=mesh(group,new THREE.TorusGeometry(0.065,0.015,8,20),steel,[x,0.7,0.25]); cup.rotation.x=Math.PI/2;
    }
    const number=textPanel(group,selected?"24":offset<0?"23":"25",[0.17,0.085],[0,1.13,-0.125],{fontSize:150});
    if(selected) {
      const glow=new THREE.MeshBasicMaterial({color:"#ffd89b"});
      const halo=mesh(group,new THREE.TorusGeometry(0.7,0.018,8,64),glow,[0,0.03,0]); halo.rotation.x=Math.PI/2;
    }
    return group;
  };
  const neighbors=[buildSeat(-0.9,false),buildSeat(0.9,false)];
  const focalSeat=buildSeat(0,true);
  return {stadium,seatOrigin,focalSeat,neighbors};
}
