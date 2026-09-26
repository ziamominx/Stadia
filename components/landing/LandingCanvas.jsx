"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingCanvas({ onProgressUpdate }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.007);

    const camera = new THREE.PerspectiveCamera(
      42,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    camera.up.set(0, 1, 0); // Strict upright horizon constraint

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Architectural Wireframe Materials
    const baseMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
    });
    const brightMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.82,
    });
    const focalMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      linewidth: 2,
    });
    const faintMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
    });

    const createBoxWireframe = (w, h, d, mat) => {
      const geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      return new THREE.LineSegments(geo, mat);
    };

    // --- 1. STADIUM GEOMETRY AT WORLD ORIGIN (0, 0, 0) ---
    const stadiumGroup = new THREE.Group();
    scene.add(stadiumGroup);

    // 1.1 Pitch & Field Markings
    const pitchGroup = new THREE.Group();
    stadiumGroup.add(pitchGroup);

    const fieldL = 36;
    const fieldW = 24;
    const pitchPoints = [
      new THREE.Vector3(-fieldL / 2, 0.05, -fieldW / 2),
      new THREE.Vector3(fieldL / 2, 0.05, -fieldW / 2),
      new THREE.Vector3(fieldL / 2, 0.05, fieldW / 2),
      new THREE.Vector3(-fieldL / 2, 0.05, fieldW / 2),
      new THREE.Vector3(-fieldL / 2, 0.05, -fieldW / 2),
    ];
    pitchGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pitchPoints), brightMat));

    const halfLine = [new THREE.Vector3(0, 0.05, -fieldW / 2), new THREE.Vector3(0, 0.05, fieldW / 2)];
    pitchGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(halfLine), faintMat));

    const centerCircle = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, 4.5, 0, Math.PI * 2, true).getPoints(48).map(p => new THREE.Vector3(p.x, 0.05, p.y))
      ),
      brightMat
    );
    pitchGroup.add(centerCircle);

    // Penalty Boxes & Goal Nets
    [-1, 1].forEach((dir) => {
      const boxX = (fieldL / 2) * dir;
      const boxD = 14;
      const penaltyBoxPoints = [
        new THREE.Vector3(boxX, 0.05, -boxD / 2),
        new THREE.Vector3(boxX - 6 * dir, 0.05, -boxD / 2),
        new THREE.Vector3(boxX - 6 * dir, 0.05, boxD / 2),
        new THREE.Vector3(boxX, 0.05, boxD / 2),
      ];
      pitchGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(penaltyBoxPoints), faintMat));

      const goalPostGroup = new THREE.Group();
      goalPostGroup.position.set(boxX, 0.05, 0);
      const goalW = 4.2;
      const goalH = 2.0;
      const goalD = 1.6;
      const goalFront = [
        new THREE.Vector3(0, 0, -goalW / 2),
        new THREE.Vector3(0, goalH, -goalW / 2),
        new THREE.Vector3(0, goalH, goalW / 2),
        new THREE.Vector3(0, 0, goalW / 2),
      ];
      goalPostGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(goalFront), brightMat));

      const goalBack = [
        new THREE.Vector3(dir * goalD, 0, -goalW / 2),
        new THREE.Vector3(dir * goalD, goalH * 0.7, -goalW / 2),
        new THREE.Vector3(0, goalH, -goalW / 2),
        new THREE.Vector3(0, goalH, goalW / 2),
        new THREE.Vector3(dir * goalD, goalH * 0.7, goalW / 2),
        new THREE.Vector3(dir * goalD, 0, goalW / 2),
      ];
      goalPostGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(goalBack), faintMat));
      pitchGroup.add(goalPostGroup);
    });

    // 1.2 Multi-Tier Grandstand Bowl
    const bowlGroup = new THREE.Group();
    stadiumGroup.add(bowlGroup);

    // Lower Bowl
    for (let r = 0; r <= 6; r++) {
      const rx = 24.5 + r * 1.8;
      const rz = 17.5 + r * 1.3;
      const ry = r * 0.9;
      const pts = new THREE.EllipseCurve(0, 0, rx, rz, 0, 2 * Math.PI, false, 0)
        .getPoints(72)
        .map(p => new THREE.Vector3(p.x, ry, p.y));
      bowlGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), r % 2 === 0 ? baseMat : faintMat));
    }

    // Mid Concourse Mezzanine with Vomitory Portals
    const midConcoursePoints = new THREE.EllipseCurve(0, 0, 36.5, 26, 0, 2 * Math.PI, false, 0)
      .getPoints(72)
      .map(p => new THREE.Vector3(p.x, 6.2, p.y));
    bowlGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(midConcoursePoints), brightMat));

    for (let v = 0; v < 12; v++) {
      const angle = (v / 12) * Math.PI * 2;
      const vx = Math.cos(angle) * 36.5;
      const vz = Math.sin(angle) * 26;
      const vomitory = createBoxWireframe(2.2, 1.8, 1.4, faintMat);
      vomitory.position.set(vx, 6.8, vz);
      vomitory.lookAt(0, 6.8, 0);
      bowlGroup.add(vomitory);
    }

    // Upper Bowl Tiers
    for (let r = 0; r <= 8; r++) {
      const rx = 37.5 + r * 1.4;
      const rz = 27 + r * 1.05;
      const ry = 7.2 + r * 1.25;
      const pts = new THREE.EllipseCurve(0, 0, rx, rz, 0, 2 * Math.PI, false, 0)
        .getPoints(72)
        .map(p => new THREE.Vector3(p.x, ry, p.y));
      bowlGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), r === 8 ? brightMat : baseMat));
    }

    // Space-Frame Roof Canopy Trusses
    const roofGroup = new THREE.Group();
    stadiumGroup.add(roofGroup);

    const compRingPoints = new THREE.EllipseCurve(0, 0, 50, 37.5, 0, 2 * Math.PI, false, 0)
      .getPoints(72)
      .map(p => new THREE.Vector3(p.x, 19, p.y));
    roofGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(compRingPoints), brightMat));

    const tensionRingPoints = new THREE.EllipseCurve(0, 0, 27, 19, 0, 2 * Math.PI, false, 0)
      .getPoints(72)
      .map(p => new THREE.Vector3(p.x, 22.5, p.y));
    roofGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(tensionRingPoints), focalMat));

    for (let t = 0; t < 28; t++) {
      const angle = (t / 28) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const pOuter = new THREE.Vector3(cosA * 50, 19, sinA * 37.5);
      const pInner = new THREE.Vector3(cosA * 27, 22.5, sinA * 19);
      const pMid = new THREE.Vector3(cosA * 38, 23.5, sinA * 28);
      roofGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pOuter, pMid, pInner, pOuter]), faintMat));
    }

    // 4 Floodlight Pylons
    [[-42, -32], [42, -32], [-42, 32], [42, 32]].forEach(([tx, tz]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(tx, 0, tz);
      const pylonPts = [
        new THREE.Vector3(-1.5, 0, -1.5), new THREE.Vector3(0, 28, 0),
        new THREE.Vector3(1.5, 0, -1.5), new THREE.Vector3(0, 28, 0),
        new THREE.Vector3(1.5, 0, 1.5), new THREE.Vector3(0, 28, 0),
        new THREE.Vector3(-1.5, 0, 1.5), new THREE.Vector3(0, 28, 0),
      ];
      towerGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pylonPts), brightMat));
      const bank = createBoxWireframe(4.5, 2.5, 0.8, focalMat);
      bank.position.set(0, 28, 0);
      bank.lookAt(0, 5, 0);
      towerGroup.add(bank);
      stadiumGroup.add(towerGroup);
    });

    // Exterior Facade & West Gate Archway
    for (let c = 0; c < 36; c++) {
      const angle = (c / 36) * Math.PI * 2;
      const nextAngle = ((c + 1) / 36) * Math.PI * 2;
      const pBase1 = new THREE.Vector3(Math.cos(angle) * 49, 0, Math.sin(angle) * 36.5);
      const pTop1 = new THREE.Vector3(Math.cos(angle) * 50, 19, Math.sin(angle) * 37.5);
      const pTop2 = new THREE.Vector3(Math.cos(nextAngle) * 50, 19, Math.sin(nextAngle) * 37.5);
      stadiumGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pBase1, pTop2, pTop1]), faintMat));
    }

    // Dedicated West Gate Concourse Portal at (-48, 0, 0)
    const westGatePortal = createBoxWireframe(8, 7, 3, focalMat);
    westGatePortal.position.set(-48, 3.5, 0);
    stadiumGroup.add(westGatePortal);

    // --- 2. AUTHENTIC STADIUM BUCKET SEAT (WEST GRANDSTAND A12-18-24) ---
    const seatOrigin = new THREE.Vector3(-27.5, 4.2, 0);
    const seatGroup = new THREE.Group();
    seatGroup.position.copy(seatOrigin);
    seatGroup.rotation.y = Math.PI / 2;
    stadiumGroup.add(seatGroup);

    // Concrete Step Riser
    const concreteStep = createBoxWireframe(3.2, 0.5, 2.2, faintMat);
    concreteStep.position.set(0, -0.25, 0);
    seatGroup.add(concreteStep);

    // Neighbor context seats
    [-1.0, 1.0].forEach((offX) => {
      const neighbor = new THREE.Group();
      neighbor.position.set(offX, 0, 0);
      const nBase = createBoxWireframe(0.65, 0.1, 0.5, faintMat);
      nBase.position.y = 0.45;
      const nBack = createBoxWireframe(0.65, 0.7, 0.1, faintMat);
      nBack.position.set(0, 0.85, -0.25);
      neighbor.add(nBase, nBack);
      seatGroup.add(neighbor);
    });

    // The Focal Seat (Sector A12, Row 18, Seat 24)
    const focalSeat = new THREE.Group();
    seatGroup.add(focalSeat);

    // Pedestal Mount & Stanchion
    const pedestalGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.45, 0),
      new THREE.Vector3(-0.25, 0.45, 0), new THREE.Vector3(0.25, 0.45, 0),
    ]);
    focalSeat.add(new THREE.Line(pedestalGeo, focalMat));

    // Contoured Bucket Seat Pan & Cushion Ribs
    const seatPanFrame = createBoxWireframe(0.68, 0.08, 0.54, focalMat);
    seatPanFrame.position.set(0, 0.45, 0.08);
    focalSeat.add(seatPanFrame);

    for (let r = -2; r <= 2; r++) {
      const ribPts = [new THREE.Vector3(-0.3, 0.49, r * 0.09 + 0.08), new THREE.Vector3(0.3, 0.49, r * 0.09 + 0.08)];
      focalSeat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(ribPts), brightMat));
    }

    // Contoured Ergonomic Backrest
    const backFrame = createBoxWireframe(0.68, 0.72, 0.09, focalMat);
    backFrame.position.set(0, 0.88, -0.22);
    backFrame.rotation.x = -0.12;
    focalSeat.add(backFrame);

    for (let b = 0; b < 4; b++) {
      const bY = 0.65 + b * 0.15;
      const bPts = [new THREE.Vector3(-0.3, bY, -0.18 - b * 0.02), new THREE.Vector3(0.3, bY, -0.18 - b * 0.02)];
      focalSeat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(bPts), brightMat));
    }

    // Armrests with Integrated Cup Holders
    [-0.38, 0.38].forEach((ax) => {
      const armPts = [
        new THREE.Vector3(ax, 0.45, -0.18), new THREE.Vector3(ax, 0.72, -0.15),
        new THREE.Vector3(ax, 0.72, 0.18), new THREE.Vector3(ax, 0.58, 0.18),
      ];
      focalSeat.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(armPts), focalMat));

      const cupRing = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.Path().absarc(0, 0, 0.05, 0, Math.PI * 2, true).getPoints(16).map(p => new THREE.Vector3(ax + p.x, 0.72, 0.22 + p.y))
        ),
        brightMat
      );
      focalSeat.add(cupRing);
    });

    const numPlate = createBoxWireframe(0.18, 0.12, 0.02, focalMat);
    numPlate.position.set(0, 1.18, -0.26);
    focalSeat.add(numPlate);

    const focusTarget = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 0, 0.85, 0, Math.PI * 2, true).getPoints(36).map(p => new THREE.Vector3(p.x, 0.03, p.y))
      ),
      focalMat
    );
    focalSeat.add(focusTarget);

    // --- 3. 3D CREDENTIAL TICKET BADGE (AT SEAT POSITION) ---
    const ticketGroup = new THREE.Group();
    ticketGroup.position.copy(seatOrigin);
    ticketGroup.position.y += 0.9;
    ticketGroup.rotation.y = Math.PI / 2;
    ticketGroup.scale.set(0.001, 0.001, 0.001);
    stadiumGroup.add(ticketGroup);

    const ticketW = 3.6;
    const ticketH = 2.1;
    const ticketFrame = createBoxWireframe(ticketW, ticketH, 0.03, focalMat);
    ticketGroup.add(ticketFrame);

    const lanyardHole = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.4, ticketH / 2 + 0.25, 0),
        new THREE.Vector3(0.4, ticketH / 2 + 0.25, 0),
        new THREE.Vector3(0.3, ticketH / 2, 0),
        new THREE.Vector3(-0.3, ticketH / 2, 0),
      ]),
      focalMat
    );
    ticketGroup.add(lanyardHole);

    // High-Resolution Procedural Texture for Credential
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px monospace";
      ctx.fillText("STADIA // OFFICIAL CREDENTIAL", 60, 85);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.font = "20px monospace";
      ctx.fillText("AUTHENTICATED ATTENDEE TOKEN", 60, 120);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 52px -apple-system, sans-serif";
      ctx.fillText("INDIA  vs  AUSTRALIA", 60, 195);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "24px -apple-system, sans-serif";
      ctx.fillText("WANKHEDE STADIUM, MUMBAI  ·  12 OCTOBER 2026", 60, 240);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 275);
      ctx.lineTo(canvas.width - 60, 275);
      ctx.stroke();

      const modules = [
        { label: "GATE", val: "WEST GATE" },
        { label: "SECTION", val: "A12" },
        { label: "ROW", val: "18" },
        { label: "SEAT", val: "24" },
      ];
      modules.forEach((mod, idx) => {
        const x = 60 + idx * 190;
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.font = "16px monospace";
        ctx.fillText(mod.label, x, 320);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 34px -apple-system, monospace";
        ctx.fillText(mod.val, x, 365);
      });

      const bcY = 430;
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      for (let b = 0; b < 56; b++) {
        const barWidth = b % 4 === 0 ? 7 : (b % 2 === 0 ? 3 : 5);
        ctx.fillRect(60 + b * 15, bcY, barWidth, 65);
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.font = "17px monospace";
      ctx.fillText("TOKEN: STADIA-48291-AUTH // INTERMODAL TRANSIT ACTIVE", 60, 545);
      ctx.fillText("HASH: 0x9f4a...88c2 · BIOMETRIC FAST-TRACK ENABLED", 60, 580);
    }

    const ticketTex = new THREE.CanvasTexture(canvas);
    ticketTex.minFilter = THREE.LinearFilter;
    const ticketPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(ticketW * 0.98, ticketH * 0.96),
      new THREE.MeshBasicMaterial({
        map: ticketTex,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      })
    );
    ticketPlane.position.z = 0.02;
    ticketGroup.add(ticketPlane);

    // --- 4. ARTERIAL HIGHWAY CONNECTED TO WEST GATE PLAZA ---
    // Begins right at West Gate plaza (-48, 0, 0) and curves out to Hotel (-145, 0, -42)
    const highwayGroup = new THREE.Group();
    scene.add(highwayGroup);

    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-48, 0.1, 0),
      new THREE.Vector3(-65, 0.1, -6),
      new THREE.Vector3(-88, 0.1, -16),
      new THREE.Vector3(-118, 0.1, -28),
      new THREE.Vector3(-145, 0.1, -40),
    ]);

    const roadPts = roadCurve.getPoints(120);
    const roadL = [];
    const roadR = [];
    const roadCenter = [];

    roadPts.forEach((p, idx) => {
      roadCenter.push(p);
      const tangent = roadCurve.getTangent(idx / 120);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      roadL.push(new THREE.Vector3().copy(p).addScaledVector(normal, 4.0));
      roadR.push(new THREE.Vector3().copy(p).addScaledVector(normal, -4.0));
    });

    highwayGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(roadL), focalMat));
    highwayGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(roadR), focalMat));
    highwayGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(roadCenter), faintMat));

    // Streetlight poles along outer barrier
    for (let l = 10; l < roadPts.length - 10; l += 18) {
      const lampPos = roadL[l];
      const poleGeo = new THREE.BufferGeometry().setFromPoints([
        lampPos,
        new THREE.Vector3(lampPos.x, 6, lampPos.z),
        new THREE.Vector3(lampPos.x + 1.2, 6.2, lampPos.z + 1.2),
      ]);
      highwayGroup.add(new THREE.Line(poleGeo, faintMat));
    }

    // Detailed Aerodynamic Electric Vehicle
    const carGroup = new THREE.Group();
    highwayGroup.add(carGroup);

    const chassis = createBoxWireframe(4.4, 0.45, 2.0, brightMat);
    chassis.position.y = 0.5;
    carGroup.add(chassis);

    const hoodPts = [
      new THREE.Vector3(-2.2, 0.5, -0.95), new THREE.Vector3(-1.0, 0.85, -0.9),
      new THREE.Vector3(-1.0, 0.85, 0.9), new THREE.Vector3(-2.2, 0.5, 0.95),
      new THREE.Vector3(-2.2, 0.5, -0.95),
    ];
    carGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(hoodPts), focalMat));

    const cabinPts = [
      new THREE.Vector3(-1.0, 0.85, -0.85), new THREE.Vector3(-0.2, 1.55, -0.75),
      new THREE.Vector3(1.2, 1.55, -0.75), new THREE.Vector3(1.9, 0.85, -0.85),
      new THREE.Vector3(1.9, 0.85, 0.85), new THREE.Vector3(1.2, 1.55, 0.75),
      new THREE.Vector3(-0.2, 1.55, 0.75), new THREE.Vector3(-1.0, 0.85, 0.85),
      new THREE.Vector3(-1.0, 0.85, -0.85),
    ];
    carGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cabinPts), focalMat));

    const frontLightPts = [new THREE.Vector3(-2.22, 0.55, -0.9), new THREE.Vector3(-2.22, 0.55, 0.9)];
    carGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(frontLightPts), focalMat));

    const rearLightPts = [new THREE.Vector3(2.22, 0.65, -0.9), new THREE.Vector3(2.22, 0.65, 0.9)];
    carGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rearLightPts), brightMat));

    const wheelLocs = [
      [-1.35, 0.45, 1.02], [1.35, 0.45, 1.02],
      [-1.35, 0.45, -1.02], [1.35, 0.45, -1.02],
    ];
    wheelLocs.forEach(([wx, wy, wz]) => {
      const wheelSub = new THREE.Group();
      wheelSub.position.set(wx, wy, wz);
      const tireRim = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(
          new THREE.Path().absarc(0, 0, 0.45, 0, Math.PI * 2, true).getPoints(24).map(p => new THREE.Vector3(p.x, p.y, 0))
        ),
        brightMat
      );
      wheelSub.add(tireRim);
      for (let s = 0; s < 5; s++) {
        const a = (s / 5) * Math.PI * 2;
        const spoke = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(Math.cos(a) * 0.44, Math.sin(a) * 0.44, 0),
          ]),
          focalMat
        );
        wheelSub.add(spoke);
      }
      carGroup.add(wheelSub);
    });

    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.2, 0.55, -0.75), new THREE.Vector3(-10.5, 0.1, -1.8),
      new THREE.Vector3(-2.2, 0.55, 0.75), new THREE.Vector3(-10.5, 0.1, 1.8),
    ]);
    carGroup.add(new THREE.LineSegments(beamGeo, faintMat));

    // --- 5. MODERNIST LUXURY HOTEL PAVILION (AT END OF ROAD) ---
    const hotelGroup = new THREE.Group();
    hotelGroup.position.set(-150, 0, -45);
    scene.add(hotelGroup);

    const lobby = createBoxWireframe(24, 7, 18, brightMat);
    lobby.position.set(0, 3.5, 0);
    hotelGroup.add(lobby);

    for (let m = -10; m <= 10; m += 4) {
      const mullion = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(m, 0, 9), new THREE.Vector3(m, 7, 9)]),
        faintMat
      );
      hotelGroup.add(mullion);
    }

    const canopy = createBoxWireframe(14, 0.6, 12, focalMat);
    canopy.position.set(0, 5.2, 14);
    hotelGroup.add(canopy);

    [-5, 5].forEach((px) => {
      const pillar = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(px, 0, 18), new THREE.Vector3(px, 5.2, 18)]),
        focalMat
      );
      hotelGroup.add(pillar);
    });

    const drivewayLoop = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(
        new THREE.Path().absarc(0, 16, 9.5, 0, Math.PI * 2, true).getPoints(48).map(p => new THREE.Vector3(p.x, 0.05, p.y))
      ),
      brightMat
    );
    hotelGroup.add(drivewayLoop);

    const tower = createBoxWireframe(18, 24, 14, brightMat);
    tower.position.set(0, 19, -2);
    hotelGroup.add(tower);

    for (let f = 1; f < 6; f++) {
      const slab = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-9, 7 + f * 4, 5), new THREE.Vector3(9, 7 + f * 4, 5),
          new THREE.Vector3(9, 7 + f * 4, -9), new THREE.Vector3(-9, 7 + f * 4, -9),
        ]),
        faintMat
      );
      hotelGroup.add(slab);
    }

    const penthouse = createBoxWireframe(24, 5, 12, focalMat);
    penthouse.position.set(3, 33.5, 0);
    hotelGroup.add(penthouse);

    const pool = createBoxWireframe(10, 1.2, 4.5, focalMat);
    pool.position.set(7, 36.6, 2);
    hotelGroup.add(pool);

    const landscapeGrid = new THREE.GridHelper(50, 18, 0x555555, 0x1a1a1a);
    landscapeGrid.position.set(0, 0.02, 10);
    hotelGroup.add(landscapeGrid);

    // --- CONTINUOUS CATMULL-ROM 3D CAMERA RIG ---
    // Smooth flight path with ZERO abrupt angles or piecewise jumps
    const cameraSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 36, 68),       // 0.00: High Exterior Overview
      new THREE.Vector3(0, 30, 56),       // 0.15: Rotation established
      new THREE.Vector3(-12, 14, 28),     // 0.30: Gliding into bowl
      new THREE.Vector3(-22, 6.5, 8),     // 0.42: Entering West Grandstand
      new THREE.Vector3(-26.0, 5.0, 2.8), // 0.50: Settled at Seat 24
      new THREE.Vector3(-25.8, 5.0, 3.2), // 0.60: Ticket unfolding
      new THREE.Vector3(-42, 4.5, 4),     // 0.72: Passing out through West Gate
      new THREE.Vector3(-68, 4.0, -8),    // 0.82: Following electric vehicle
      new THREE.Vector3(-108, 4.5, -24),  // 0.92: Vehicle approaching hotel
      new THREE.Vector3(-136, 12, -22),   // 1.00: Resolved Hotel View
    ], false, "catmullrom", 0.5);

    const lookAtSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2, 0),         // 0.00: Pitch center
      new THREE.Vector3(0, 2, 0),         // 0.15: Pitch center
      new THREE.Vector3(-16, 3, 4),       // 0.30: Grandstand sweep
      new THREE.Vector3(-27.5, 4.5, 0),   // 0.42: Seat approach
      new THREE.Vector3(-27.5, 4.5, 0),   // 0.50: Seat locked
      new THREE.Vector3(-27.5, 4.8, 0),   // 0.60: Ticket locked
      new THREE.Vector3(-55, 1.5, -2),    // 0.72: Looking toward road
      new THREE.Vector3(-85, 1.2, -14),   // 0.82: Tracking car
      new THREE.Vector3(-135, 2.0, -32),  // 0.92: Tracking car stopping
      new THREE.Vector3(-150, 14, -45),   // 1.00: Hotel pavilion
    ], false, "catmullrom", 0.5);

    // --- GSAP SCROLLTRIGGER SCRUB (BUTTERY SMOOTH INERTIA) ---
    const progressProxy = { val: 0 };
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: ".lp-scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2, // 1.2s of buttery GSAP inertia smoothing
      onUpdate: (self) => {
        progressProxy.val = self.progress;
        if (onProgressUpdate) onProgressUpdate(self.progress);
      },
    });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    // --- 60FPS CONTINUOUS RENDER LOOP ---
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const p = Math.min(Math.max(progressProxy.val, 0), 1);
      const px = mouseX * 0.3;
      const py = mouseY * 0.2;

      // 1. Sample Camera & LookAt along the smooth C² splines
      const camPos = cameraSpline.getPointAt(p);
      camera.position.set(camPos.x + px, camPos.y + py, camPos.z);

      const lookTarget = lookAtSpline.getPointAt(p);
      camera.lookAt(lookTarget.x, lookTarget.y, lookTarget.z);
      camera.up.set(0, 1, 0); // Strict horizon lock

      // 2. Continuous Stadium Model 25° Y-axis Rotation (0.06 to 0.22)
      if (p <= 0.24) {
        const tRot = Math.min(1, Math.max(0, (p - 0.06) / 0.16));
        // Smooth sine ease in-out for stadium rotation
        const easeRot = 0.5 * (1 - Math.cos(tRot * Math.PI));
        stadiumGroup.rotation.y = easeRot * (25 * Math.PI / 180);
      } else {
        stadiumGroup.rotation.y = (25 * Math.PI / 180);
      }

      // 3. Physical Seat -> Ticket Unfolding (0.48 to 0.64)
      if (p < 0.48) {
        focalSeat.scale.set(1, 1, 1);
        focalSeat.visible = true;
        ticketGroup.scale.set(0.001, 0.001, 0.001);
        ticketGroup.visible = false;
      } else if (p <= 0.64) {
        const tUnfold = (p - 0.48) / 0.16;
        focalSeat.visible = true;
        ticketGroup.visible = true;

        // Seat lines gracefully separate and fold down
        const seatScale = Math.max(0.001, 1 - tUnfold * 1.15);
        focalSeat.scale.set(seatScale, seatScale, seatScale);

        // Ticket lines assemble and expand outward
        const ticketScale = Math.min(1.0, tUnfold * 1.15);
        ticketGroup.scale.set(ticketScale, ticketScale, ticketScale);
        ticketGroup.position.y = seatOrigin.y + 0.9 + Math.sin(tUnfold * Math.PI) * 0.15;
        ticketPlane.material.opacity = Math.min(1.0, tUnfold * 1.4);
      } else if (p <= 0.75) {
        focalSeat.visible = false;
        ticketGroup.visible = true;
        const tFade = (p - 0.64) / 0.11;
        ticketPlane.material.opacity = Math.max(0, 1 - tFade * 2);
        ticketGroup.position.y = seatOrigin.y + 0.9 + tFade * 4;
      } else {
        focalSeat.visible = false;
        ticketGroup.visible = false;
      }

      // 4. Vehicle Navigation along Arterial Roadway (0.72 to 1.00)
      if (p >= 0.70) {
        const tCar = Math.min(1, Math.max(0, (p - 0.70) / 0.26));
        const carPoint = roadCurve.getPointAt(tCar * 0.85); // Travels down road
        const carTangent = roadCurve.getTangentAt(tCar * 0.85);

        carGroup.position.copy(carPoint);
        const carAngle = Math.atan2(-carTangent.z, carTangent.x);
        carGroup.rotation.y = carAngle + Math.PI / 2;
        carGroup.visible = true;
      } else {
        const startP = roadCurve.getPointAt(0.05);
        carGroup.position.copy(startP);
        carGroup.rotation.y = -0.3;
        carGroup.visible = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (scrollTriggerInstance) scrollTriggerInstance.kill();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onProgressUpdate]);

  return (
    <div className="lp-viewport" ref={containerRef}>
      {/* Three.js canvas dynamically attached */}
    </div>
  );
}
