import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const G = 6.67430e-11;
const C = 299792458;
const SOLAR_MASS = 1.98847e30;
const KM = 1000;

const canvas = document.querySelector("#cosmosCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070b, 0.00018);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.01, 200000);
camera.position.set(0, 8, 34);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.minDistance = 0.25;
controls.maxDistance = 120000;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.08;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.85, 0.45, 0.16);
composer.addPass(bloomPass);

const ui = {
  loading: document.querySelector("#loadingScreen"),
  modeButtons: document.querySelectorAll(".mode-button"),
  panels: document.querySelectorAll(".panel-section"),
  scaleZoom: document.querySelector("#scaleZoom"),
  scaleName: document.querySelector("#scaleName"),
  scaleDistance: document.querySelector("#scaleDistance"),
  scaleBrief: document.querySelector("#scaleBrief"),
  stellarMass: document.querySelector("#stellarMass"),
  stellarMassLabel: document.querySelector("#stellarMassLabel"),
  stellarStage: document.querySelector("#stellarStage"),
  stellarBrief: document.querySelector("#stellarBrief"),
  runEvolution: document.querySelector("#runEvolution"),
  blackHoleMass: document.querySelector("#blackHoleMass"),
  objectDistance: document.querySelector("#objectDistance"),
  spawnButtons: document.querySelectorAll("[data-spawn]"),
  telemetryMode: document.querySelector("#telemetryMode"),
  telemetryPrimary: document.querySelector("#telemetryPrimary"),
  telemetryValue: document.querySelector("#telemetryValue"),
  telemetryPhysics: document.querySelector("#telemetryPhysics"),
  hint: document.querySelector("#interactionHint")
};

const scaleLevels = [
  { name: "Human", realDiameter: "1.7 m", realDistance: "0 m", description: "The biological scale where instruments and observers begin.", scientificFact: "Human vision sees only a tiny band of the electromagnetic spectrum.", color: 0xf8f9fa, type: "observer", logSize: 0 },
  { name: "Building", realDiameter: "100 m", realDistance: "street scale", description: "Local architecture becomes a measurable landmark.", scientificFact: "A 100 m structure is already about 60 human heights.", color: 0x4cc9f0, type: "structure", logSize: 1 },
  { name: "City", realDiameter: "50 km", realDistance: "regional scale", description: "Human civilization becomes a glowing network on a planet.", scientificFact: "City lights reveal human activity from orbit.", color: 0xffd166, type: "civilization", logSize: 2 },
  { name: "Earth", realDiameter: "12,742 km", realDistance: "1 Earth diameter", description: "A rocky planet with oceans, atmosphere, and life.", scientificFact: "Earth's atmosphere is thinner than the skin of an apple by comparison.", color: 0x4cc9f0, type: "planet", logSize: 3 },
  { name: "Earth-Moon System", realDiameter: "768,800 km", realDistance: "384,400 km to Moon", description: "The first true jump into empty space.", scientificFact: "Every planet in the Solar System could fit between Earth and the Moon on average distance.", color: 0xdce8ff, type: "binary", logSize: 4 },
  { name: "Solar System", realDiameter: "~9 billion km", realDistance: "30 AU to Neptune", description: "The Sun's planetary family stretches across light-hours.", scientificFact: "Light takes over 4 hours to reach Neptune.", color: 0xffd166, type: "system", logSize: 5 },
  { name: "Oort Cloud", realDiameter: "~3 light-years", realDistance: "2,000-100,000 AU", description: "A distant comet reservoir near the Sun's gravitational boundary.", scientificFact: "The Oort Cloud may extend a large fraction of the way to the nearest stars.", color: 0x9bbcff, type: "shell", logSize: 6 },
  { name: "Nearest Stars", realDiameter: "10 light-years", realDistance: "4.24 ly to Proxima Centauri", description: "The Sun becomes one star among its immediate neighbors.", scientificFact: "Proxima Centauri's light takes more than four years to reach Earth.", color: 0xff9f6e, type: "stars", logSize: 7 },
  { name: "Orion Arm", realDiameter: "10,000 light-years", realDistance: "local spiral arm", description: "Our stellar neighborhood is a minor arm of the Milky Way.", scientificFact: "The Solar System orbits the galaxy once every roughly 230 million years.", color: 0x9bdfff, type: "arm", logSize: 8 },
  { name: "Milky Way", realDiameter: "~100,000 light-years", realDistance: "galactic scale", description: "A barred spiral galaxy containing hundreds of billions of stars.", scientificFact: "The central black hole Sagittarius A* has about four million solar masses.", color: 0xf8f9fa, type: "galaxy", logSize: 9 },
  { name: "Local Group", realDiameter: "~10 million light-years", realDistance: "galaxy group", description: "The Milky Way, Andromeda, Triangulum, and many dwarf galaxies.", scientificFact: "The Milky Way and Andromeda are moving toward a future merger.", color: 0x6a4c93, type: "group", logSize: 10 },
  { name: "Virgo Cluster", realDiameter: "~15 million light-years", realDistance: "~54 million ly away", description: "A major galaxy cluster influencing our cosmic neighborhood.", scientificFact: "Clusters contain hot gas, galaxies, and dark matter.", color: 0x4cc9f0, type: "cluster", logSize: 11 },
  { name: "Laniakea Supercluster", realDiameter: "~520 million light-years", realDistance: "supercluster scale", description: "A vast gravitational basin containing our galaxy.", scientificFact: "Laniakea means immense heaven in Hawaiian.", color: 0xffd166, type: "supercluster", logSize: 12 },
  { name: "Cosmic Web", realDiameter: "billions of light-years", realDistance: "large-scale structure", description: "Galaxies trace filaments around enormous cosmic voids.", scientificFact: "Dark matter scaffolding shapes the web-like arrangement of galaxies.", color: 0x4cc9f0, type: "web", logSize: 13 },
  { name: "Observable Universe", realDiameter: "~93 billion light-years", realDistance: "cosmic horizon", description: "The region whose light has had time to reach us since the early universe.", scientificFact: "The observable universe is not the same as the entire universe.", color: 0xf8f9fa, type: "horizon", logSize: 14 }
];

const stellarPresets = [
  { label: "0.3 Solar Masses", mass: 0.3, radius: 0.34, temperature: 3300, luminosity: 0.01, lifespan: "Trillions of years", fate: "White Dwarf", color: 0xff6b5d, fusion: "slow hydrogen fusion" },
  { label: "1 Solar Mass", mass: 1, radius: 1, temperature: 5800, luminosity: 1, lifespan: "~10 billion years", fate: "White Dwarf", color: 0xffd166, fusion: "hydrogen to helium" },
  { label: "8 Solar Masses", mass: 8, radius: 4.4, temperature: 21000, luminosity: 5000, lifespan: "~40 million years", fate: "Neutron Star", color: 0xb9e8ff, fusion: "rapid core fusion" },
  { label: "20 Solar Masses", mass: 20, radius: 8.2, temperature: 32000, luminosity: 90000, lifespan: "~9 million years", fate: "Black Hole", color: 0x7fcfff, fusion: "heavy element fusion" },
  { label: "50 Solar Masses", mass: 50, radius: 14, temperature: 42000, luminosity: 700000, lifespan: "~4 million years", fate: "Black Hole", color: 0xd9f7ff, fusion: "unstable massive-star fusion" }
];

const state = {
  mode: "scale",
  clock: new THREE.Clock(),
  cameraRig: { zoom: 3, targetZoom: 3, position: new THREE.Vector3(), velocity: new THREE.Vector3() },
  stellar: { presetIndex: 1, running: false, phase: 0, stage: "Main Sequence" },
  blackHole: { mass: 12, distance: 92, orbiters: [] }
};

const groups = {
  scale: new THREE.Group(),
  stellar: new THREE.Group(),
  blackhole: new THREE.Group()
};
scene.add(groups.scale, groups.stellar, groups.blackhole);

const spectralColors = {
  O: new THREE.Color(0xaecbff),
  B: new THREE.Color(0xc9ddff),
  A: new THREE.Color(0xf8f9ff),
  F: new THREE.Color(0xfff2cb),
  G: new THREE.Color(0xffd166),
  K: new THREE.Color(0xffa15c),
  M: new THREE.Color(0xff6b5d)
};

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function formatScientific(value, unit = "") {
  if (!Number.isFinite(value)) return "∞";
  const abs = Math.abs(value);
  const formatted = abs >= 1e6 || abs < 0.01 ? value.toExponential(2) : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return `${formatted}${unit}`;
}

function buildInstancedStarField() {
  const geometry = new THREE.SphereGeometry(0.42, 6, 4);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.86 });
  const stars = new THREE.InstancedMesh(geometry, material, 50000);
  stars.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const types = Object.keys(spectralColors);

  for (let i = 0; i < stars.count; i += 1) {
    const radius = Math.pow(Math.random(), 0.38) * 85000 + 120;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(randomRange(-1, 1));
    const size = randomRange(0.18, 1.55) * (Math.random() > 0.985 ? 3.2 : 1);
    matrix.compose(
      new THREE.Vector3(radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta)),
      new THREE.Quaternion(),
      new THREE.Vector3(size, size, size)
    );
    stars.setMatrixAt(i, matrix);
    color.copy(spectralColors[types[Math.floor(Math.random() * types.length)]]).multiplyScalar(randomRange(0.55, 1.75));
    stars.setColorAt(i, color);
  }
  groups.scale.add(stars);
  return stars;
}

function buildGalaxyParticles(count, radius, colorA, colorB, arms = 4) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  const a = new THREE.Color(colorA);
  const b = new THREE.Color(colorB);

  for (let i = 0; i < count; i += 1) {
    const r = Math.pow(Math.random(), 0.55) * radius;
    const arm = (i % arms) / arms * Math.PI * 2;
    const angle = arm + r * 0.018 + randomRange(-0.22, 0.22);
    const height = randomRange(-1, 1) * Math.max(1, radius * 0.025) * (1 - r / radius);
    positions[i * 3] = Math.cos(angle) * r + randomRange(-2, 2);
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * r + randomRange(-2, 2);
    color.copy(a).lerp(b, r / radius).multiplyScalar(randomRange(0.7, 1.25));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: radius * 0.012, vertexColors: true, transparent: true, opacity: 0.86, depthWrite: false, blending: THREE.AdditiveBlending });
  return new THREE.Points(geometry, material);
}

function buildCosmicScaleScene() {
  buildInstancedStarField();

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(4.4, 96, 48),
    new THREE.MeshStandardMaterial({ color: 0x1f75ff, roughness: 0.82, metalness: 0.02, emissive: 0x061b4a, emissiveIntensity: 0.18 })
  );
  earth.name = "Earth scale anchor";
  groups.scale.add(earth);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(4.55, 96, 48),
    new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending })
  );
  groups.scale.add(atmosphere);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 24), new THREE.MeshStandardMaterial({ color: 0xb8c0ca, roughness: 1 }));
  moon.position.set(18, 0.8, 0);
  groups.scale.add(moon);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(8, 96, 48),
    new THREE.MeshBasicMaterial({ color: 0xffd166 })
  );
  sun.position.set(-130, 0, -40);
  sun.userData.pulse = true;
  groups.scale.add(sun);

  for (let i = 0; i < 7; i += 1) {
    const orbit = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 220 }, (_, j) => {
        const a = j / 220 * Math.PI * 2;
        const r = 28 + i * 21;
        return new THREE.Vector3(Math.cos(a) * r - 130, 0, Math.sin(a) * r - 40);
      })),
      new THREE.LineBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.16 })
    );
    groups.scale.add(orbit);
  }

  const milkyWay = buildGalaxyParticles(26000, 2200, 0xf8f9fa, 0x6a4c93, 5);
  milkyWay.position.set(0, -120, -6200);
  milkyWay.rotation.x = 1.18;
  groups.scale.add(milkyWay);

  const cosmicWeb = new THREE.Group();
  const filamentMaterial = new THREE.LineBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending });
  for (let i = 0; i < 180; i += 1) {
    const start = new THREE.Vector3(randomRange(-45000, 45000), randomRange(-28000, 28000), randomRange(-45000, 45000));
    const end = start.clone().add(new THREE.Vector3(randomRange(-6000, 6000), randomRange(-3500, 3500), randomRange(-6000, 6000)));
    cosmicWeb.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([start, end]), filamentMaterial));
  }
  groups.scale.add(cosmicWeb);

  const light = new THREE.DirectionalLight(0xffffff, 2.5);
  light.position.set(-10, 8, 12);
  groups.scale.add(light, new THREE.AmbientLight(0x9bdfff, 0.35));
}

function createStarMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      baseColor: { value: new THREE.Color(0xffd166) },
      hotColor: { value: new THREE.Color(0xf8f9fa) },
      turbulence: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform float time;
      uniform float turbulence;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        float wave = sin(position.y * 8.0 + time * 2.1) * 0.035 + sin(position.x * 11.0 - time * 1.7) * 0.025;
        vec3 displaced = position + normal * wave * turbulence;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform float time;
      uniform vec3 baseColor;
      uniform vec3 hotColor;
      uniform float turbulence;
      void main() {
        float bands = sin((vUv.x + vUv.y) * 34.0 + time * 1.8) * 0.5 + 0.5;
        float cells = sin(vUv.x * 88.0 + time) * sin(vUv.y * 74.0 - time * 1.3) * 0.5 + 0.5;
        float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
        vec3 color = mix(baseColor, hotColor, bands * 0.35 + cells * 0.25);
        color += rim * turbulence * 0.7;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

const stellarObjects = {};
function buildStellarLab() {
  stellarObjects.nebula = buildNebula(9000, 58, 0x6a4c93, 0x4cc9f0);
  groups.stellar.add(stellarObjects.nebula);

  stellarObjects.starMaterial = createStarMaterial();
  stellarObjects.star = new THREE.Mesh(new THREE.SphereGeometry(8, 160, 80), stellarObjects.starMaterial);
  groups.stellar.add(stellarObjects.star);

  stellarObjects.corona = new THREE.Mesh(
    new THREE.SphereGeometry(10.8, 96, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: { color: { value: new THREE.Color(0xffd166) }, power: { value: 2.2 } },
      vertexShader: "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec3 vNormal; uniform vec3 color; uniform float power; void main(){ float glow = pow(1.0 - abs(vNormal.z), power); gl_FragColor = vec4(color, glow * 0.42); }"
    })
  );
  groups.stellar.add(stellarObjects.corona);

  stellarObjects.flares = new THREE.Group();
  groups.stellar.add(stellarObjects.flares);
  for (let i = 0; i < 10; i += 1) {
    const flare = new THREE.Mesh(
      new THREE.ConeGeometry(0.25, randomRange(4, 10), 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })
    );
    flare.rotation.set(randomRange(0, Math.PI), randomRange(0, Math.PI), randomRange(0, Math.PI));
    stellarObjects.flares.add(flare);
  }

  stellarObjects.supernova = createParticleBurst(6000, 0xffd166);
  stellarObjects.supernova.visible = false;
  groups.stellar.add(stellarObjects.supernova);

  groups.stellar.position.set(0, 0, 0);
}

function buildNebula(count, radius, colorA, colorB) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const a = new THREE.Color(colorA);
  const b = new THREE.Color(colorB);
  const c = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const r = Math.pow(Math.random(), 0.5) * radius;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(randomRange(-1, 1));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.45;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    c.copy(a).lerp(b, Math.random());
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.34, vertexColors: true, transparent: true, opacity: 0.36, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function createParticleBurst(count, color) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const direction = new THREE.Vector3(randomRange(-1, 1), randomRange(-1, 1), randomRange(-1, 1)).normalize();
    velocities.set(direction.multiplyScalar(randomRange(8, 56)).toArray(), i * 3);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color, size: 0.22, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
}

const blackHoleObjects = {};
function buildBlackHoleLab() {
  blackHoleObjects.grid = createSpacetimeGrid(54, 5);
  groups.blackhole.add(blackHoleObjects.grid);

  blackHoleObjects.horizon = new THREE.Mesh(new THREE.SphereGeometry(5, 96, 48), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  groups.blackhole.add(blackHoleObjects.horizon);

  blackHoleObjects.ring = new THREE.Mesh(
    new THREE.TorusGeometry(9.8, 1.4, 18, 220),
    new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, inner: { value: new THREE.Color(0xffd166) }, outer: { value: new THREE.Color(0x6a4c93) } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec2 vUv; uniform float time; uniform vec3 inner; uniform vec3 outer; void main(){ float streak = sin(vUv.x * 80.0 - time * 7.0) * 0.5 + 0.5; vec3 color = mix(outer, inner, streak); gl_FragColor = vec4(color, 0.78 * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.72, vUv.y)); }"
    })
  );
  blackHoleObjects.ring.rotation.x = Math.PI / 2.8;
  groups.blackhole.add(blackHoleObjects.ring);

  blackHoleObjects.lensingShell = new THREE.Mesh(
    new THREE.SphereGeometry(17, 128, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { strength: { value: 1 }, time: { value: 0 } },
      vertexShader: "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec3 vNormal; uniform float strength; uniform float time; void main(){ float ring = pow(1.0 - abs(vNormal.z), 8.0); float shimmer = sin(time * 4.0 + vNormal.x * 20.0) * 0.08; gl_FragColor = vec4(0.76, 0.92, 1.0, (ring + shimmer) * 0.22 * strength); }"
    })
  );
  groups.blackhole.add(blackHoleObjects.lensingShell);

  const backgroundGalaxies = buildGalaxyParticles(9000, 1300, 0x4cc9f0, 0xf8f9fa, 6);
  backgroundGalaxies.position.z = -2400;
  groups.blackhole.add(backgroundGalaxies);
}

function createSpacetimeGrid(lines, spacing) {
  const points = [];
  const half = lines * spacing * 0.5;
  for (let i = 0; i <= lines; i += 1) {
    const a = -half + i * spacing;
    points.push(new THREE.Vector3(-half, 0, a), new THREE.Vector3(half, 0, a));
    points.push(new THREE.Vector3(a, 0, -half), new THREE.Vector3(a, 0, half));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.userData.original = Float32Array.from(geometry.attributes.position.array);
  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.26 }));
}

function setMode(mode) {
  state.mode = mode;
  groups.scale.visible = mode === "scale";
  groups.stellar.visible = mode === "stellar";
  groups.blackhole.visible = mode === "blackhole";
  ui.modeButtons.forEach(button => button.classList.toggle("active", button.dataset.mode === mode));
  ui.panels.forEach(panel => panel.classList.toggle("hidden", panel.dataset.panel !== mode));
  controls.autoRotate = mode !== "blackhole";

  if (mode === "scale") {
    camera.position.set(0, 8, 34);
    controls.target.set(0, 0, 0);
    ui.telemetryMode.textContent = "Cosmic Scale Explorer";
  } else if (mode === "stellar") {
    camera.position.set(0, 10, 38);
    controls.target.set(0, 0, 0);
    ui.telemetryMode.textContent = "Stellar Evolution Laboratory";
  } else {
    camera.position.set(0, 64, 92);
    controls.target.set(0, 0, 0);
    ui.telemetryMode.textContent = "Black Hole Physics Laboratory";
  }
  controls.update();
}

function updateScaleExplorer(delta) {
  state.cameraRig.targetZoom = Number(ui.scaleZoom.value);
  state.cameraRig.zoom += (state.cameraRig.targetZoom - state.cameraRig.zoom) * Math.min(1, delta * 3.2);
  const exactIndex = THREE.MathUtils.clamp(Math.round(state.cameraRig.zoom), 0, scaleLevels.length - 1);
  const level = scaleLevels[exactIndex];
  const distance = Math.pow(2.65, state.cameraRig.zoom) * 9;
  const height = Math.pow(1.82, state.cameraRig.zoom) * 3;

  camera.position.lerp(new THREE.Vector3(distance * 0.58, height, distance), 0.045);
  controls.target.lerp(new THREE.Vector3(0, 0, state.cameraRig.zoom > 8 ? -2500 : 0), 0.035);
  camera.near = Math.max(0.01, distance / 90000);
  camera.far = Math.max(200000, distance * 28);
  camera.updateProjectionMatrix();

  groups.scale.rotation.y += delta * 0.018;
  ui.scaleName.textContent = level.name;
  ui.scaleDistance.textContent = level.realDiameter;
  ui.scaleBrief.textContent = `${level.description} ${level.scientificFact}`;
  ui.telemetryPrimary.textContent = level.name;
  ui.telemetryValue.textContent = `${level.realDiameter} diameter`;
  ui.telemetryPhysics.textContent = `Zoom 10^${level.logSize} • ${level.type}`;
}

function updateStarLifecycle(delta) {
  const preset = stellarPresets[state.stellar.presetIndex];
  const phase = state.stellar.running ? state.stellar.phase : 0.34;
  if (state.stellar.running) {
    state.stellar.phase = Math.min(1, state.stellar.phase + delta * 0.045);
    if (state.stellar.phase >= 1) state.stellar.running = false;
  }

  let radiusMultiplier = preset.radius;
  let brightness = Math.min(5.4, 0.75 + Math.log10(preset.luminosity + 1) * 0.85);
  let stage = "Main Sequence";
  stellarObjects.supernova.visible = false;

  if (phase < 0.18) {
    stage = "Nebula Collapse";
    radiusMultiplier = 0.25 + phase * 5;
    brightness = 0.5;
  } else if (phase < 0.32) {
    stage = "Protostar";
    radiusMultiplier = preset.radius * 0.72;
    brightness *= 0.62;
  } else if (phase < 0.62) {
    stage = "Main Sequence";
  } else if (phase < 0.78) {
    stage = preset.mass >= 8 ? "Red Supergiant" : "Red Giant";
    radiusMultiplier = preset.radius * (preset.mass >= 8 ? 2.1 : 1.75);
    brightness *= 1.25;
  } else if (phase < 0.9) {
    stage = preset.mass >= 8 ? "Supernova" : "Planetary Nebula";
    brightness *= preset.mass >= 8 ? 9.5 : 1.5;
    if (preset.mass >= 8) triggerSupernova(delta);
  } else {
    stage = preset.fate;
    radiusMultiplier = preset.fate === "White Dwarf" ? 0.28 : preset.fate === "Neutron Star" ? 0.16 : 0.42;
    brightness = preset.fate === "Black Hole" ? 0.05 : 2.4;
  }

  state.stellar.stage = stage;
  const displayRadius = THREE.MathUtils.clamp(radiusMultiplier * 8, 2, 28);
  stellarObjects.star.scale.lerp(new THREE.Vector3(displayRadius / 8, displayRadius / 8, displayRadius / 8), 0.08);
  stellarObjects.corona.scale.copy(stellarObjects.star.scale).multiplyScalar(1.24 + brightness * 0.04);
  stellarObjects.starMaterial.uniforms.time.value += delta;
  stellarObjects.starMaterial.uniforms.baseColor.value.setHex(stage.includes("Red") ? 0xff6b5d : preset.color);
  stellarObjects.starMaterial.uniforms.turbulence.value = 0.85 + preset.mass / 24 + (stage === "Supernova" ? 5 : 0);
  stellarObjects.corona.material.uniforms.color.value.setHex(stage === "Black Hole" ? 0x4cc9f0 : preset.color);
  stellarObjects.nebula.rotation.y += delta * 0.035;
  stellarObjects.nebula.material.opacity = stage.includes("Nebula") ? 0.52 : 0.18;
  bloomPass.strength = state.mode === "stellar" ? Math.min(2.4, 0.62 + brightness * 0.22) : 0.85;

  ui.stellarMassLabel.textContent = preset.label;
  ui.stellarStage.textContent = stage;
  ui.stellarBrief.textContent = `Mass ${preset.mass} M☉ • ${preset.temperature.toLocaleString()} K • ${preset.fusion} • lifespan ${preset.lifespan} • final fate: ${preset.fate}.`;
  ui.telemetryPrimary.textContent = stage;
  ui.telemetryValue.textContent = `${preset.mass} solar masses, luminosity ${formatScientific(preset.luminosity)} L☉`;
  ui.telemetryPhysics.textContent = `Fusion: ${preset.fusion}`;
}

function triggerSupernova(delta) {
  stellarObjects.supernova.visible = true;
  const positions = stellarObjects.supernova.geometry.attributes.position;
  const velocities = stellarObjects.supernova.geometry.attributes.velocity;
  for (let i = 0; i < positions.count; i += 1) {
    positions.array[i * 3] += velocities.array[i * 3] * delta;
    positions.array[i * 3 + 1] += velocities.array[i * 3 + 1] * delta;
    positions.array[i * 3 + 2] += velocities.array[i * 3 + 2] * delta;
  }
  positions.needsUpdate = true;
}

function updateBlackHoleLab(delta) {
  const massSolar = Number(ui.blackHoleMass.value);
  state.blackHole.mass = massSolar;
  state.blackHole.distance = Number(ui.objectDistance.value);

  const massKg = massSolar * SOLAR_MASS;
  const schwarzschildRadiusM = (2 * G * massKg) / (C * C);
  const schwarzschildRadiusKm = schwarzschildRadiusM / KM;
  const displayRadius = THREE.MathUtils.clamp(schwarzschildRadiusKm / 8.5, 2.5, 28);
  const sampleDistanceM = Math.max(schwarzschildRadiusM * 1.02, state.blackHole.distance * 1e7 * KM);
  const escapeVelocity = Math.sqrt((2 * G * massKg) / sampleDistanceM);
  const gravity = (G * massKg) / (sampleDistanceM * sampleDistanceM);
  const timeDilation = Math.sqrt(Math.max(0, 1 - schwarzschildRadiusM / sampleDistanceM));
  const danger = sampleDistanceM <= schwarzschildRadiusM * 1.08 ? "Event Horizon" : escapeVelocity > C * 0.5 ? "Extreme" : "Orbital";

  blackHoleObjects.horizon.scale.setScalar(displayRadius / 5);
  blackHoleObjects.ring.scale.setScalar(displayRadius / 5.4 + 0.85);
  blackHoleObjects.ring.material.uniforms.time.value += delta;
  blackHoleObjects.lensingShell.scale.setScalar(displayRadius / 9 + 1.3);
  blackHoleObjects.lensingShell.material.uniforms.strength.value = THREE.MathUtils.clamp(massSolar / 30, 0.4, 3.2);
  blackHoleObjects.lensingShell.material.uniforms.time.value += delta;
  curveSpacetimeGrid(displayRadius, massSolar);
  updateOrbiters(delta, displayRadius, massSolar);

  ui.telemetryPrimary.textContent = `${massSolar.toFixed(1)} solar-mass black hole`;
  ui.telemetryValue.textContent = `Rs ${formatScientific(schwarzschildRadiusKm, " km")}`;
  ui.telemetryPhysics.textContent = `Escape ${formatScientific(escapeVelocity, " m/s")} • dilation ${timeDilation.toFixed(3)} • ${danger}`;
}

function curveSpacetimeGrid(radius, massSolar) {
  const position = blackHoleObjects.grid.geometry.attributes.position;
  const original = blackHoleObjects.grid.geometry.userData.original;
  for (let i = 0; i < position.count; i += 1) {
    const x = original[i * 3];
    const z = original[i * 3 + 2];
    const r = Math.sqrt(x * x + z * z);
    position.array[i * 3 + 1] = -Math.min(42, (massSolar * 11) / Math.max(5, r + radius));
  }
  position.needsUpdate = true;
}

function spawnObject(kind) {
  const distance = state.blackHole.distance;
  const angle = Math.random() * Math.PI * 2;
  let mesh;
  if (kind === "ship") {
    mesh = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.6, 4), new THREE.MeshStandardMaterial({ color: 0xf8f9fa, emissive: 0x4cc9f0, emissiveIntensity: 0.4 }));
  } else if (kind === "particles") {
    mesh = createParticleBurst(900, 0x4cc9f0);
  } else {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  }
  mesh.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
  const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).multiplyScalar(Math.sqrt(Math.max(0.4, state.blackHole.mass / distance)) * 16);
  state.blackHole.orbiters.push({ mesh, velocity: tangent, kind });
  groups.blackhole.add(mesh);
}

function updateOrbiters(delta, horizonRadius, massSolar) {
  const pull = massSolar * 900;
  state.blackHole.orbiters = state.blackHole.orbiters.filter(body => {
    const r = body.mesh.position.length();
    if (r < horizonRadius * 1.8) {
      groups.blackhole.remove(body.mesh);
      body.mesh.geometry.dispose();
      return false;
    }
    const accel = body.mesh.position.clone().normalize().multiplyScalar(-pull / Math.max(80, r * r));
    body.velocity.addScaledVector(accel, delta);
    body.mesh.position.addScaledVector(body.velocity, delta);
    body.mesh.rotation.y += delta * 2;
    return true;
  });
}

function connectEvents() {
  ui.modeButtons.forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  ui.scaleZoom.addEventListener("input", () => { state.cameraRig.targetZoom = Number(ui.scaleZoom.value); });
  window.addEventListener("wheel", event => {
    if (state.mode !== "scale") return;
    state.cameraRig.targetZoom = THREE.MathUtils.clamp(state.cameraRig.targetZoom + event.deltaY * 0.0025, 0, 14);
    ui.scaleZoom.value = state.cameraRig.targetZoom;
  }, { passive: true });
  ui.stellarMass.addEventListener("input", () => {
    state.stellar.presetIndex = Number(ui.stellarMass.value);
    state.stellar.running = false;
    state.stellar.phase = 0.34;
  });
  ui.runEvolution.addEventListener("click", () => {
    state.stellar.running = true;
    state.stellar.phase = 0;
    const positions = stellarObjects.supernova.geometry.attributes.position;
    positions.array.fill(0);
    positions.needsUpdate = true;
  });
  ui.blackHoleMass.addEventListener("input", () => updateBlackHoleLab(0));
  ui.objectDistance.addEventListener("input", () => { state.blackHole.distance = Number(ui.objectDistance.value); });
  ui.spawnButtons.forEach(button => button.addEventListener("click", () => spawnObject(button.dataset.spawn)));
  window.addEventListener("resize", resize);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloomPass.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(0.033, state.clock.getDelta());
  if (state.mode === "scale") updateScaleExplorer(delta);
  if (state.mode === "stellar") updateStarLifecycle(delta);
  if (state.mode === "blackhole") updateBlackHoleLab(delta);
  controls.update();
  composer.render();
}

buildCosmicScaleScene();
buildStellarLab();
buildBlackHoleLab();
connectEvents();
setMode("scale");
updateScaleExplorer(0.016);
setTimeout(() => ui.loading.classList.add("hidden"), 700);
animate();
