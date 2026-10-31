import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface JungleSceneProps {
  scrollProgressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isCarouselHoveredRef: React.MutableRefObject<boolean>;
  activeEncounterRef: React.MutableRefObject<'none' | 'porcupine' | 'dogs' | 'lion'>;
  mistDensity: 'dense' | 'clear';
  cameraOverride: 'scroll' | 'canopy' | 'porcupine' | 'dogs' | 'lion' | 'basecamp';
}

// Module-scope reusable math objects for Zero GC in render loop
const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();
const _currentCamLook = new THREE.Vector3(0, 0, 0);
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();

export const JungleCanvas3D: React.FC<JungleSceneProps> = ({
  scrollProgressRef,
  pointerRef,
  isCarouselHoveredRef,
  activeEncounterRef,
  mistDensity,
  cameraOverride,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const mistDensityRef = useRef(mistDensity);
  const cameraOverrideRef = useRef(cameraOverride);

  useEffect(() => {
    mistDensityRef.current = mistDensity;
  }, [mistDensity]);

  useEffect(() => {
    cameraOverrideRef.current = cameraOverride;
  }, [cameraOverride]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null; // Let the matching jungle-theme-gradient shine through!
    scene.fog = new THREE.FogExp2(0x0e2112, 0.015);

    const getResponsiveFov = () => (window.innerWidth < 768 ? 65 : 52);

    const camera = new THREE.PerspectiveCamera(
      getResponsiveFov(),
      window.innerWidth / window.innerHeight,
      0.2,
      190
    );
    camera.position.set(0, 56, 18);
    camera.lookAt(0, 0, 10);

    // 2. Mandatory RoomEnvironment PMREM Reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Natural Rainforest Golden-Hour & Canopy Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xcbe0b8, 0x241a0f, 0.95);
    hemiLight.position.set(0, 60, 0);
    scene.add(hemiLight);

    const sunKeyLight = new THREE.DirectionalLight(0xffe09e, 2.4);
    sunKeyLight.position.set(22, 55, 16);
    sunKeyLight.castShadow = !isSoftwareGl;
    sunKeyLight.shadow.mapSize.width = 1024;
    sunKeyLight.shadow.mapSize.height = 1024;
    sunKeyLight.shadow.camera.near = 5;
    sunKeyLight.shadow.camera.far = 110;
    const d = 45;
    sunKeyLight.shadow.camera.left = -d;
    sunKeyLight.shadow.camera.right = d;
    sunKeyLight.shadow.camera.top = d;
    sunKeyLight.shadow.camera.bottom = -d;
    sunKeyLight.shadow.bias = -0.0005;
    sunKeyLight.shadow.normalBias = 0.02;
    scene.add(sunKeyLight);

    const rimLight = new THREE.DirectionalLight(0x78b868, 1.15);
    rimLight.position.set(-28, 25, -35);
    scene.add(rimLight);

    // 4. Procedural Textures (Cloud Mist, Mottled Fur, Contact Shadow)
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const createCloudTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
      g.addColorStop(0, 'rgba(236, 232, 210, 0.72)');
      g.addColorStop(0.45, 'rgba(186, 204, 175, 0.36)');
      g.addColorStop(0.8, 'rgba(130, 155, 125, 0.12)');
      g.addColorStop(1, 'rgba(130, 155, 125, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      return tex;
    };

    const createMottledCoatTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#241a12';
      ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 28; i++) {
        ctx.fillStyle = i % 3 === 0 ? '#d89b48' : i % 3 === 1 ? '#e8e4d8' : '#7a4b21';
        ctx.beginPath();
        ctx.arc((i * 43) % 128, (i * 71) % 128, 8 + (i % 9), 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      return tex;
    };

    const createShadowTexture = () => {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d')!;
      const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
      g.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const cloudTex = createCloudTexture();
    const wildDogCoatTex = createMottledCoatTexture();
    const shadowTex = createShadowTexture();

    // 5. Undulating Natural Jungle Floor & Leaf-Litter Trail
    const groundHeightAt = (x: number, z: number): number => {
      const distFromTrail = Math.abs(x - Math.sin(z * 0.06) * 2.5);
      const bank = Math.min(distFromTrail * 0.14, 3.2);
      const undulation = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.45;
      return bank + undulation;
    };

    const groundGeo = new THREE.PlaneGeometry(180, 200, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);
      posAttr.setY(i, groundHeightAt(vx, vz));
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x172112,
      roughness: 0.92,
      metalness: 0.04,
      transparent: true,
      opacity: 0.88,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const streamGeo = new THREE.PlaneGeometry(6.8, 175, 16, 48);
    streamGeo.rotateX(-Math.PI / 2);
    const sPos = streamGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const vz = sPos.getZ(i);
      const vx = sPos.getX(i) + Math.sin(vz * 0.06) * 2.5;
      sPos.setX(i, vx);
      sPos.setY(i, groundHeightAt(vx, vz) + 0.03);
    }
    streamGeo.computeVertexNormals();
    const streamMat = new THREE.MeshStandardMaterial({
      color: 0x231a10,
      roughness: 0.35,
      metalness: 0.18,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const streamMesh = new THREE.Mesh(streamGeo, streamMat);
    streamMesh.receiveShadow = true;
    scene.add(streamMesh);

    // 6. Instanced Dense Rainforest Trees
    const treeCount = 180;
    const trunkGeo = new THREE.CylinderGeometry(0.45, 0.9, 16, 7);
    trunkGeo.translate(0, 8, 0);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x2b1e12,
      roughness: 0.88,
      metalness: 0.02,
    });

    const crownLowerGeo = new THREE.DodecahedronGeometry(4.9, 1);
    crownLowerGeo.scale(1.32, 0.55, 1.32);
    crownLowerGeo.translate(0, 14.5, 0);
    const crownLowerMat = new THREE.MeshStandardMaterial({
      color: 0x1a3b1e,
      roughness: 0.75,
      metalness: 0.05,
    });

    const crownUpperGeo = new THREE.DodecahedronGeometry(6.3, 1);
    crownUpperGeo.scale(1.45, 0.48, 1.45);
    crownUpperGeo.translate(0, 18.2, 0);
    const crownUpperMat = new THREE.MeshStandardMaterial({
      color: 0x2a5429,
      roughness: 0.64,
      metalness: 0.08,
    });

    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);
    const crownLowerInst = new THREE.InstancedMesh(crownLowerGeo, crownLowerMat, treeCount);
    const crownUpperInst = new THREE.InstancedMesh(crownUpperGeo, crownUpperMat, treeCount);
    trunkInst.castShadow = !isSoftwareGl;
    crownUpperInst.castShadow = !isSoftwareGl;
    crownUpperInst.receiveShadow = true;

    for (let i = 0; i < treeCount; i++) {
      let tx = ((i * 37) % 110) - 55;
      const tz = 32 - ((i * 53) % 135);
      const trailCenter = Math.sin(tz * 0.06) * 2.5;
      if (Math.abs(tx - trailCenter) < 6.5) {
        tx += tx >= trailCenter ? 7.2 : -7.2;
      }
      const ty = groundHeightAt(tx, tz);
      const scale = 0.84 + ((i * 19) % 45) * 0.012;

      _dummy.position.set(tx, ty, tz);
      _dummy.rotation.set(0, (i * 1.3) % (Math.PI * 2), 0);
      _dummy.scale.set(scale, scale * (0.9 + (i % 5) * 0.06), scale);
      _dummy.updateMatrix();

      trunkInst.setMatrixAt(i, _dummy.matrix);
      crownLowerInst.setMatrixAt(i, _dummy.matrix);
      crownUpperInst.setMatrixAt(i, _dummy.matrix);

      const hueShift = ((i % 7) - 3) * 0.015;
      _color.setHSL(0.33 + hueShift, 0.54, 0.16 + (i % 4) * 0.025);
      crownLowerInst.setColorAt(i, _color);
      _color.setHSL(0.31 + hueShift, 0.58, 0.22 + (i % 5) * 0.03);
      crownUpperInst.setColorAt(i, _color);
    }

    trunkInst.computeBoundingSphere();
    crownLowerInst.computeBoundingSphere();
    crownUpperInst.computeBoundingSphere();
    scene.add(trunkInst, crownLowerInst, crownUpperInst);

    // Hero Top-Down Canopy Emergent Crowns
    const heroCanopyGroup = new THREE.Group();
    const heroCrownPositions: Array<{ x: number; z: number; s: number; side: number }> = [];
    for (let c = 0; c < 18; c++) {
      const angle = (c / 18) * Math.PI * 2;
      const radius = 3.5 + (c % 3) * 4.2;
      const cx = Math.cos(angle) * radius;
      const cz = 10 + Math.sin(angle) * radius;
      const crownMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(4.5, 1),
        new THREE.MeshStandardMaterial({
          color: c % 2 === 0 ? 0x204523 : 0x2f5c2e,
          roughness: 0.7,
          metalness: 0.05,
        })
      );
      crownMesh.scale.set(1.4, 0.45, 1.4);
      crownMesh.position.set(cx, 21 + (c % 4) * 1.4, cz);
      heroCanopyGroup.add(crownMesh);
      heroCrownPositions.push({ x: cx, z: cz, s: 1.4, side: cx >= 0 ? 1 : -1 });
    }
    scene.add(heroCanopyGroup);

    // 7. Volumetric Clouds Layer
    const cloudGroup = new THREE.Group();
    interface CloudData {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      side: number;
      speed: number;
    }
    const clouds: CloudData[] = [];
    const cloudPlaneGeo = new THREE.PlaneGeometry(26, 26);
    cloudPlaneGeo.rotateX(-Math.PI / 2);

    for (let i = 0; i < 34; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(cloudPlaneGeo, mat);
      const ring = Math.floor(i / 8);
      const angle = (i % 8) * (Math.PI / 4) + ring * 0.4;
      const dist = ring * 6.5 + (i % 3) * 2.2;
      const bx = Math.cos(angle) * dist;
      const bz = 10 + Math.sin(angle) * dist;
      const by = 28 + (i % 5) * 2.4;

      mesh.position.set(bx, by, bz);
      mesh.rotation.y = (i * 0.7) % (Math.PI * 2);
      const sc = 0.85 + (i % 4) * 0.3;
      mesh.scale.set(sc, 1, sc);
      mesh.renderOrder = 5;

      cloudGroup.add(mesh);
      clouds.push({
        mesh,
        baseX: bx,
        baseY: by,
        baseZ: bz,
        side: bx >= 0 ? 1 : -1,
        speed: 0.3 + (i % 5) * 0.12,
      });
    }
    scene.add(cloudGroup);

    // 8. Composite 3–12 Part Procedural 3D Wild Animals + Parting Foliage
    const addContactShadow = (parent: THREE.Group, radiusX: number, radiusZ: number) => {
      const shGeo = new THREE.PlaneGeometry(radiusX * 2.4, radiusZ * 2.4);
      shGeo.rotateX(-Math.PI / 2);
      const shMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      });
      const sh = new THREE.Mesh(shGeo, shMat);
      sh.position.y = 0.03;
      parent.add(sh);
    };

    // --- ANIMAL 1: CAPE PORCUPINE at Z = -5 ---
    const porcupineGroup = new THREE.Group();
    const porcX = -3.4;
    const porcZ = -5.0;
    porcupineGroup.position.set(porcX, groundHeightAt(porcX, porcZ), porcZ);
    porcupineGroup.rotation.y = 0.65;
    addContactShadow(porcupineGroup, 1.5, 1.2);

    const porcBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1c1612,
      roughness: 0.85,
      metalness: 0.08,
    });
    const porcHeadMat = new THREE.MeshStandardMaterial({
      color: 0x2b221c,
      roughness: 0.6,
      metalness: 0.12,
    });
    const quillWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf4f5f0,
      roughness: 0.35,
      metalness: 0.15,
    });
    const quillDarkMat = new THREE.MeshStandardMaterial({
      color: 0x16120f,
      roughness: 0.45,
      metalness: 0.1,
    });

    const porcTorso = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), porcBodyMat);
    porcTorso.scale.set(1.35, 0.82, 0.92);
    porcTorso.position.set(0, 0.62, 0);
    porcTorso.castShadow = !isSoftwareGl;
    porcupineGroup.add(porcTorso);

    const porcHead = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), porcHeadMat);
    porcHead.position.set(0.95, 0.58, 0);
    porcupineGroup.add(porcHead);

    const porcSnout = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 8), porcHeadMat);
    porcSnout.rotation.z = -Math.PI / 2;
    porcSnout.position.set(1.28, 0.52, 0);
    porcupineGroup.add(porcSnout);

    const porcCrest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.22), quillWhiteMat);
    porcCrest.position.set(0.75, 0.95, 0);
    porcCrest.rotation.z = 0.35;
    porcupineGroup.add(porcCrest);

    const porcLegGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.48, 8);
    [
      [0.5, 0.24, 0.36],
      [0.5, 0.24, -0.36],
      [-0.55, 0.24, 0.38],
      [-0.55, 0.24, -0.38],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(porcLegGeo, porcBodyMat);
      leg.position.set(lx, ly, lz);
      porcupineGroup.add(leg);
    });

    const quillFanGroup = new THREE.Group();
    quillFanGroup.position.set(-0.2, 0.72, 0);
    const quillSpines: Array<{ mesh: THREE.Group; baseRotZ: number; baseRotY: number }> = [];
    const quillLowerGeo = new THREE.CylinderGeometry(0.025, 0.032, 0.85, 6);
    quillLowerGeo.translate(0, 0.42, 0);
    const quillTipGeo = new THREE.ConeGeometry(0.028, 0.95, 6);
    quillTipGeo.translate(0, 1.32, 0);

    for (let q = 0; q < 32; q++) {
      const qGroup = new THREE.Group();
      const lower = new THREE.Mesh(quillLowerGeo, quillDarkMat);
      const tip = new THREE.Mesh(quillTipGeo, quillWhiteMat);
      qGroup.add(lower, tip);

      const row = Math.floor(q / 8);
      const col = (q % 8) - 3.5;
      const rotZ = 0.45 + row * 0.26;
      const rotY = col * 0.22;
      qGroup.rotation.set(col * 0.14, rotY, rotZ);
      quillFanGroup.add(qGroup);
      quillSpines.push({ mesh: qGroup, baseRotZ: rotZ, baseRotY: rotY });
    }
    porcupineGroup.add(quillFanGroup);
    scene.add(porcupineGroup);

    // --- ANIMAL 2: AFRICAN WILD DOGS PACK at Z = -22 ---
    const wildDogsPackGroup = new THREE.Group();
    const dogsX = 3.6;
    const dogsZ = -22.0;
    wildDogsPackGroup.position.set(dogsX, groundHeightAt(dogsX, dogsZ), dogsZ);
    wildDogsPackGroup.rotation.y = -0.62;

    const dogCoatMat = new THREE.MeshStandardMaterial({
      map: wildDogCoatTex,
      roughness: 0.72,
      metalness: 0.06,
    });
    const dogDarkMat = new THREE.MeshStandardMaterial({
      color: 0x17120e,
      roughness: 0.48,
      metalness: 0.12,
    });
    const dogWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xedeae2,
      roughness: 0.65,
      metalness: 0.05,
    });

    const buildWildDog = (offsetX: number, offsetZ: number, scale: number, yaw: number) => {
      const dog = new THREE.Group();
      dog.position.set(offsetX, 0, offsetZ);
      dog.rotation.y = yaw;
      dog.scale.setScalar(scale);
      addContactShadow(dog, 1.1, 0.8);

      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.95, 8, 12), dogCoatMat);
      torso.rotation.z = Math.PI / 2;
      torso.position.set(0, 0.88, 0);
      torso.castShadow = !isSoftwareGl;
      dog.add(torso);

      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.55, 8), dogCoatMat);
      neck.position.set(-0.55, 1.18, 0);
      neck.rotation.z = 0.45;
      dog.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.34), dogCoatMat);
      head.position.set(-0.78, 1.38, 0);
      dog.add(head);

      const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.22), dogDarkMat);
      muzzle.position.set(-1.05, 1.32, 0);
      dog.add(muzzle);

      const earGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.06, 12);
      earGeo.rotateZ(Math.PI / 2);
      const leftEar = new THREE.Mesh(earGeo, dogDarkMat);
      leftEar.position.set(-0.7, 1.64, 0.18);
      leftEar.rotation.x = 0.3;
      const rightEar = new THREE.Mesh(earGeo, dogDarkMat);
      rightEar.position.set(-0.7, 1.64, -0.18);
      rightEar.rotation.x = -0.3;
      dog.add(leftEar, rightEar);

      const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.82, 8);
      [
        [-0.45, 0.41, 0.18],
        [-0.45, 0.41, -0.18],
        [0.45, 0.41, 0.18],
        [0.45, 0.41, -0.18],
      ].forEach(([lx, ly, lz], idx) => {
        const leg = new THREE.Mesh(legGeo, idx % 2 === 0 ? dogCoatMat : dogDarkMat);
        leg.position.set(lx, ly, lz);
        dog.add(leg);
      });

      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.65, 8), dogWhiteMat);
      tail.position.set(0.78, 0.78, 0);
      tail.rotation.z = -0.85;
      dog.add(tail);

      return dog;
    };

    const alphaDog = buildWildDog(0, 0, 1.08, 0.15);
    const flankDogA = buildWildDog(1.6, -1.3, 0.94, 0.28);
    const flankDogB = buildWildDog(1.2, 1.45, 0.96, -0.12);
    wildDogsPackGroup.add(alphaDog, flankDogA, flankDogB);
    scene.add(wildDogsPackGroup);

    // --- ANIMAL 3: YOUNG MALE LION & GIANT PYTHON at Z = -39 ---
    const lionEncounterGroup = new THREE.Group();
    const lionX = -3.1;
    const lionZ = -39.0;
    lionEncounterGroup.position.set(lionX, groundHeightAt(lionX, lionZ), lionZ);
    lionEncounterGroup.rotation.y = 0.48;
    addContactShadow(lionEncounterGroup, 2.4, 1.6);

    const lionFurMat = new THREE.MeshStandardMaterial({
      color: 0xc28846,
      roughness: 0.74,
      metalness: 0.06,
    });
    const lionManeMat = new THREE.MeshStandardMaterial({
      color: 0x4f2f15,
      roughness: 0.9,
      metalness: 0.02,
    });
    const eyeAmberMat = new THREE.MeshStandardMaterial({
      color: 0xffb732,
      emissive: 0xd97706,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });

    const lionChest = new THREE.Mesh(new THREE.SphereGeometry(0.68, 14, 12), lionFurMat);
    lionChest.scale.set(1.3, 1.05, 0.95);
    lionChest.position.set(0.45, 1.08, 0);
    lionChest.castShadow = !isSoftwareGl;
    lionEncounterGroup.add(lionChest);

    const lionFlank = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.56, 1.35, 12), lionFurMat);
    lionFlank.rotation.z = Math.PI / 2 - 0.12;
    lionFlank.position.set(-0.35, 1.02, 0);
    lionFlank.castShadow = !isSoftwareGl;
    lionEncounterGroup.add(lionFlank);

    const lionMane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.76, 1), lionManeMat);
    lionMane.scale.set(0.85, 1.15, 1.1);
    lionMane.position.set(0.88, 1.28, 0);
    lionEncounterGroup.add(lionMane);

    const lionHead = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.54, 0.56), lionFurMat);
    lionHead.position.set(1.18, 1.32, 0);
    lionEncounterGroup.add(lionHead);

    const lionMuzzle = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.38), lionFurMat);
    lionMuzzle.position.set(1.52, 1.2, 0);
    lionEncounterGroup.add(lionMuzzle);

    const eyeGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, eyeAmberMat);
    eyeL.position.set(1.42, 1.4, 0.18);
    const eyeR = new THREE.Mesh(eyeGeo, eyeAmberMat);
    eyeR.position.set(1.42, 1.4, -0.18);
    lionEncounterGroup.add(eyeL, eyeR);

    const lionLegGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.98, 10);
    [
      [0.68, 0.49, 0.34],
      [0.85, 0.49, -0.34],
      [-0.78, 0.49, 0.32],
      [-0.78, 0.49, -0.32],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(lionLegGeo, lionFurMat);
      leg.position.set(lx, ly, lz);
      lionEncounterGroup.add(leg);
    });

    const lionTail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.15, 8), lionFurMat);
    lionTail.position.set(-1.35, 1.25, 0);
    lionTail.rotation.z = 0.75;
    lionEncounterGroup.add(lionTail);

    const pythonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.4, 0.18, 0.9),
      new THREE.Vector3(2.6, 0.22, -0.7),
      new THREE.Vector3(3.2, 0.48, -0.1),
      new THREE.Vector3(2.4, 0.95, 0.25),
      new THREE.Vector3(1.95, 1.38, 0.05),
    ]);
    const pythonGeo = new THREE.TubeGeometry(pythonCurve, 36, 0.19, 10, false);
    const pythonMat = new THREE.MeshStandardMaterial({
      color: 0x3b4d28,
      roughness: 0.32,
      metalness: 0.25,
    });
    const pythonMesh = new THREE.Mesh(pythonGeo, pythonMat);
    pythonMesh.castShadow = !isSoftwareGl;
    lionEncounterGroup.add(pythonMesh);

    scene.add(lionEncounterGroup);

    // 9. Parting Jungle Undergrowth Bushes along Corridor
    const foliageBushes: Array<{ group: THREE.Group; baseX: number; z: number; side: number }> = [];
    const frondGeo = new THREE.ConeGeometry(0.7, 3.3, 5);
    frondGeo.scale(1, 1, 0.22);
    frondGeo.translate(0, 1.6, 0);
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x225228,
      roughness: 0.6,
      metalness: 0.08,
    });

    for (let b = 0; b < 36; b++) {
      const bush = new THREE.Group();
      for (let f = 0; f < 7; f++) {
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.rotation.z = (f - 3) * 0.26;
        frond.rotation.y = f * 0.85;
        bush.add(frond);
      }
      const bz = 10 - b * 2.1;
      const side = b % 2 === 0 ? -1 : 1;
      const bx = Math.sin(bz * 0.06) * 2.5 + side * (2.5 + (b % 3) * 0.8);
      bush.position.set(bx, groundHeightAt(bx, bz) - 0.2, bz);
      scene.add(bush);
      foliageBushes.push({ group: bush, baseX: bx, z: bz, side });
    }

    // 10. Floating Golden Jungle Spores / Dust Motes (matching the uploaded lion photo)
    const sporeCount = 260;
    const sporeGeo = new THREE.BufferGeometry();
    const sporePos = new Float32Array(sporeCount * 3);
    for (let i = 0; i < sporeCount; i++) {
      sporePos[i * 3] = ((i * 29) % 50) - 25;
      sporePos[i * 3 + 1] = 0.5 + ((i * 17) % 24);
      sporePos[i * 3 + 2] = 20 - ((i * 41) % 95);
    }
    sporeGeo.setAttribute('position', new THREE.BufferAttribute(sporePos, 3));
    const sporeMat = new THREE.PointsMaterial({
      color: 0xf2c063,
      size: 0.2,
      transparent: true,
      opacity: 0.78,
    });
    const sporePoints = new THREE.Points(sporeGeo, sporeMat);
    scene.add(sporePoints);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 11. Animation & Camera Choreography Loop
    const clock = new THREE.Clock();
    let smoothedScroll = 0;
    let smoothedPointerX = 0;
    let smoothedPointerY = 0;
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      smoothedScroll = THREE.MathUtils.damp(
        smoothedScroll,
        scrollProgressRef.current,
        5.5,
        delta
      );
      smoothedPointerX = THREE.MathUtils.damp(
        smoothedPointerX,
        pointerRef.current.x,
        4.5,
        delta
      );
      smoothedPointerY = THREE.MathUtils.damp(
        smoothedPointerY,
        pointerRef.current.y,
        4.5,
        delta
      );

      const targetFog = mistDensityRef.current === 'dense' ? 0.017 : 0.009;
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.density = THREE.MathUtils.damp(scene.fog.density, targetFog, 3.0, delta);
      }

      const override = cameraOverrideRef.current;
      if (override === 'canopy') {
        _camTargetPos.set(0, 54, 16);
        _camTargetLook.set(0, 0, 10);
      } else if (override === 'porcupine') {
        _camTargetPos.set(0.2, 2.3, -0.8);
        _camTargetLook.set(porcX, 0.9, porcZ);
      } else if (override === 'dogs') {
        _camTargetPos.set(0.4, 2.6, -16.8);
        _camTargetLook.set(dogsX, 1.2, dogsZ);
      } else if (override === 'lion') {
        _camTargetPos.set(0.6, 2.5, -33.5);
        _camTargetLook.set(lionX + 0.8, 1.3, lionZ);
      } else if (override === 'basecamp') {
        _camTargetPos.set(0, 3.2, -52.0);
        _camTargetLook.set(0, 2.4, -68.0);
      } else {
        if (smoothedScroll < 0.24) {
          const t = THREE.MathUtils.smoothstep(smoothedScroll, 0.0, 0.24);
          const camY = THREE.MathUtils.lerp(55, 3.6, t);
          const camZ = THREE.MathUtils.lerp(14, 6, t);
          _camTargetPos.set(smoothedPointerX * 1.6, camY, camZ);

          const lookY = THREE.MathUtils.lerp(0, 2.4, t);
          const lookZ = THREE.MathUtils.lerp(9.5, -14, t);
          _camTargetLook.set(smoothedPointerX * 2.2, lookY, lookZ);
        } else {
          const t = (smoothedScroll - 0.24) / 0.76;
          const camZ = THREE.MathUtils.lerp(6, -54, t);
          const trailX = Math.sin(camZ * 0.06) * 1.8;
          _camTargetPos.set(
            trailX + smoothedPointerX * 1.2,
            3.4 + Math.sin(t * Math.PI * 2) * 0.25 + smoothedPointerY * 0.4,
            camZ
          );
          _camTargetLook.set(
            Math.sin((camZ - 12) * 0.06) * 2.2 + smoothedPointerX * 2.0,
            2.2 + smoothedPointerY * 0.7,
            camZ - 14
          );
        }
      }

      camera.position.lerp(_camTargetPos, 1 - Math.exp(-6.5 * delta));
      _currentCamLook.lerp(_camTargetLook, 1 - Math.exp(-6.5 * delta));
      camera.lookAt(_currentCamLook);

      const cloudPartProgress = THREE.MathUtils.clamp(smoothedScroll * 3.8, 0, 1);
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i];
        const partOffset = cloudPartProgress * 24 * c.side;
        c.mesh.position.x =
          c.baseX + partOffset + Math.sin(elapsed * c.speed + i) * 1.4;
        c.mesh.position.z =
          c.baseZ + Math.cos(elapsed * c.speed * 0.8 + i) * 1.1;
        const mat = c.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = (1 - cloudPartProgress * 0.85) * 0.55;
      }

      heroCanopyGroup.children.forEach((child, idx) => {
        const info = heroCrownPositions[idx];
        if (!info) return;
        child.position.x = info.x + cloudPartProgress * 6.5 * info.side;
      });

      const rustleMult = isCarouselHoveredRef.current ? 4.2 : 1.0;
      for (let b = 0; b < foliageBushes.length; b++) {
        const item = foliageBushes[b];
        const distZ = Math.abs(camera.position.z - item.z);
        const proximityPart = THREE.MathUtils.clamp(1 - distZ / 14, 0, 1);
        item.group.position.x = item.baseX + item.side * proximityPart * 1.9;
        item.group.rotation.z =
          Math.sin(elapsed * 2.2 * rustleMult + b) * 0.06 * rustleMult +
          item.side * proximityPart * 0.22;
      }

      const activeAnim = activeEncounterRef.current;

      const porcDist = Math.abs(camera.position.z - porcZ);
      const porcAlert =
        activeAnim === 'porcupine' || override === 'porcupine'
          ? 1.0
          : THREE.MathUtils.clamp(1 - porcDist / 16, 0, 1);
      porcupineGroup.position.x = THREE.MathUtils.lerp(
        porcX - 2.0,
        porcX,
        porcAlert
      );
      for (let q = 0; q < quillSpines.length; q++) {
        const qs = quillSpines[q];
        const rattle = Math.sin(elapsed * 18 + q * 1.3) * 0.05 * porcAlert;
        qs.mesh.rotation.z = qs.baseRotZ - porcAlert * 0.38 + rattle;
      }

      const dogsDist = Math.abs(camera.position.z - dogsZ);
      const dogsAlert =
        activeAnim === 'dogs' || override === 'dogs'
          ? 1.0
          : THREE.MathUtils.clamp(1 - dogsDist / 18, 0, 1);
      wildDogsPackGroup.position.x = THREE.MathUtils.lerp(
        dogsX + 2.4,
        dogsX,
        dogsAlert
      );
      alphaDog.position.y = Math.abs(Math.sin(elapsed * 3.2)) * 0.12 * dogsAlert;

      const lionDist = Math.abs(camera.position.z - lionZ);
      const lionAlert =
        activeAnim === 'lion' || override === 'lion'
          ? 1.0
          : THREE.MathUtils.clamp(1 - lionDist / 18, 0, 1);
      lionEncounterGroup.position.x = THREE.MathUtils.lerp(
        lionX - 2.1,
        lionX,
        lionAlert
      );
      lionHead.rotation.z = Math.sin(elapsed * 2.6) * 0.08 * lionAlert;
      pythonMesh.position.y = Math.sin(elapsed * 3.4) * 0.09 * lionAlert;

      sporePoints.rotation.y = elapsed * 0.02;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    const handleResize = () => {
      camera.fov = getResponsiveFov();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={canvasMountRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
