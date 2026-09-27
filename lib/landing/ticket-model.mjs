import * as THREE from "three";
import QRCode from "qrcode";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mesh, material } from "./model-utils.mjs";

export function createTicket(stadium, seatOrigin) {
  const group=new THREE.Group(); group.position.copy(seatOrigin); group.position.y+=0.9;
  group.rotation.y=Math.PI/2; group.scale.setScalar(0.001); stadium.add(group);
  mesh(group,new RoundedBoxGeometry(3.6,2.1,0.065,3,0.09),material("#dfd2b6",0.26,0.3));
  const canvas=document.createElement("canvas"); canvas.width=1536; canvas.height=896;
  const ctx=canvas.getContext("2d");
  if(ctx) {
    ctx.fillStyle="#050505"; ctx.fillRect(0,0,1536,896);
    ctx.strokeStyle="#bdbdbd"; ctx.lineWidth=3; ctx.strokeRect(22,22,1492,852);
    ctx.fillStyle="#111111"; ctx.fillRect(0,0,1536,158);
    ctx.fillStyle="#ffffff"; ctx.font="700 50px sans-serif"; ctx.fillText("STADIA",62,94);
    ctx.fillStyle="#cccccc"; ctx.font="23px monospace"; ctx.fillText("MATCH DAY  /  PREMIUM ACCESS",575,87);
    ctx.fillStyle="#999999"; ctx.font="600 22px monospace"; ctx.fillText("INTERNATIONAL CRICKET  •  12 OCT 2026",65,218);
    ctx.fillStyle="#ffffff"; ctx.font="700 78px sans-serif"; ctx.fillText("INDIA",60,324); ctx.fillText("AUSTRALIA",60,410);
    ctx.font="26px sans-serif"; ctx.fillStyle="#aaaaaa"; ctx.fillText("versus",338,324);
    ctx.font="26px sans-serif"; ctx.fillText("Wankhede Stadium · Mumbai",64,465);
    ctx.strokeStyle="#696969"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(62,509); ctx.lineTo(1000,509); ctx.stroke();
    [ ["GATE","WEST"], ["SECTION","A12"], ["ROW","18"], ["SEAT","24"] ].forEach(([label,value],i)=>{
      const x=65+i*235; ctx.fillStyle="#999999"; ctx.font="20px monospace"; ctx.fillText(label,x,558);
      ctx.fillStyle="#ffffff"; ctx.font="700 49px sans-serif"; ctx.fillText(value,x,622);
    });
    ctx.setLineDash([8,9]); ctx.beginPath(); ctx.moveTo(1070,175); ctx.lineTo(1070,817); ctx.stroke(); ctx.setLineDash([]);
    // A real QR matrix carrying explicitly illustrative, non-admission data.
    const qr=QRCode.create("STADIA DEMO | A12 | ROW18 | SEAT24",{errorCorrectionLevel:"M"}).modules;
    const cell=8, startX=1148, startY=280;
    ctx.fillStyle="#ffffff"; ctx.fillRect(startX-32,startY-32,qr.size*cell+64,qr.size*cell+64);
    ctx.fillStyle="#050505";
    for(let row=0;row<qr.size;row++) for(let col=0;col<qr.size;col++) if(qr.get(row,col)) ctx.fillRect(startX+col*cell,startY+row*cell,cell,cell);
    ctx.fillStyle="#ffffff";
    ctx.font="22px monospace"; ctx.fillText("DEMO PASS",1150,617);
    ctx.fillStyle="#999999"; ctx.font="19px sans-serif"; ctx.fillText("NOT VALID FOR ENTRY",1120,658);
    ctx.fillStyle="#171717"; ctx.fillRect(62,695,937,87);
    ctx.fillStyle="#ffffff"; ctx.font="23px sans-serif"; ctx.fillText("SEAT RESERVED    /    TRANSIT    /    HOSPITALITY",90,748);
    ctx.fillStyle="#888888"; ctx.font="18px monospace"; ctx.fillText("STADIA-48291  ·  ONE JOURNEY, EVERY CONNECTION",65,840);
  }
  const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace; texture.anisotropy=4;
  const face=mesh(group,new THREE.PlaneGeometry(3.48,1.98),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}),[0,0,0.035]);
  return {ticketGroup:group,ticketPlane:face};
}
