import * as THREE from "three";

export function createJourneyWorld() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07090c");
  scene.fog = new THREE.FogExp2("#07090c", 0.0028);
  const surfaceMat = new THREE.MeshBasicMaterial({
    color: "#10161c", polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  });
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
    const solid = new THREE.BoxGeometry(w, h, d);
    const group = new THREE.Group();
    group.add(new THREE.Mesh(solid, surfaceMat));
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(solid), mat));
    return group;
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

  const seatAccent = focalMat.clone();
  seatAccent.color.set("#e8b884");
  focalSeat.traverse(object => { if (object.isLine) object.material = seatAccent; });

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
    ctx.fillText("DEMO CREDENTIAL · SEAT / TRANSIT / HOSPITALITY", 60, 580);
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


  // Ground and surrounding architecture establish scale during the aerial flight.
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 450),
    new THREE.MeshBasicMaterial({ color: "#080c10" }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-55, -0.12, 0);
  scene.add(ground);
  const grid = new THREE.GridHelper(360, 90, "#26343e", "#121b23");
  grid.position.set(-55, -0.1, 0);
  scene.add(grid);
  for (let i = 0; i < 22; i++) {
    const height = 8 + (i * 13 % 27);
    const block = createBoxWireframe(8 + i % 3 * 3, height, 10, faintMat);
    block.position.set(-190 + i * 12, height / 2, i % 2 ? -82 : 76);
    scene.add(block);
  }

  // Thousands of physical seats remain one GPU draw call.
  const seatGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.7);
  const seatMaterial = new THREE.MeshBasicMaterial({ color: "#334550" });
  const seats = new THREE.InstancedMesh(seatGeometry, seatMaterial, 960);
  const dummy = new THREE.Object3D();
  let index = 0;
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 120; column++) {
      const angle = column / 120 * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * (37.5 + row * 1.4),
        7.6 + row * 1.25, Math.sin(angle) * (27 + row * 1.05));
      dummy.rotation.y = -angle;
      dummy.updateMatrix();
      seats.setMatrixAt(index++, dummy.matrix);
    }
  }
  stadiumGroup.add(seats);

  function dispose() {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of [object.material].flat().filter(Boolean)) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
      if (object.isInstancedMesh) object.dispose();
    });
    textures.forEach(texture => texture.dispose());
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
  }
  return { scene, seatOrigin, focalSeat, ticketGroup, ticketPlane, carGroup, roadCurve, dispose };
}
