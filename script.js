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
  cameraRig: { zoom: 0, targetZoom: 0, position: new THREE.Vector3(), velocity: new THREE.Vector3() },
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

const scaleObjects = { layers: [], marker: null };

function rememberBaseOpacity(material) {
  if (!material) return;
  material.transparent = true;
  material.userData.baseOpacity = material.opacity ?? 1;
}

function prepareLayerObject(object) {
  object.traverse(child => {
    if (!child.material) return;
    if (Array.isArray(child.material)) child.material.forEach(rememberBaseOpacity);
    else rememberBaseOpacity(child.material);
  });
  return object;
}

function setLayerOpacity(layer, opacity) {
  layer.visible = opacity > 0.015;
  layer.traverse(child => {
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(material => {
      if (material.userData.baseOpacity === undefined) rememberBaseOpacity(material);
      material.opacity = material.userData.baseOpacity * opacity;
      material.depthWrite = opacity > 0.92 && material.userData.baseOpacity >= 0.95;
    });
  });
}

function createPoints(count, radius, colorA, colorB, options = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const a = new THREE.Color(colorA);
  const b = new THREE.Color(colorB);
  const c = new THREE.Color();

  for (let i = 0; i < count; i += 1) {
    const direction = new THREE.Vector3(randomRange(-1, 1), randomRange(-1, 1), randomRange(-1, 1)).normalize();
    const distance = options.shell ? randomRange(radius * 0.72, radius) : Math.pow(Math.random(), options.power ?? 0.5) * radius;
    const flatten = options.flatten ?? 1;
    positions[i * 3] = direction.x * distance;
    positions[i * 3 + 1] = direction.y * distance * flatten;
    positions[i * 3 + 2] = direction.z * distance;
    c.copy(a).lerp(b, Math.random()).multiplyScalar(randomRange(0.6, 1.45));
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({
    size: options.size ?? 0.35,
    vertexColors: true,
    transparent: true,
    opacity: options.opacity ?? 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
}

function createInstancedStarField(count = 50000, radius = 620) {
  const geometry = new THREE.SphereGeometry(0.11, 6, 4);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 });
  const stars = new THREE.InstancedMesh(geometry, material, count);
  stars.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const types = Object.keys(spectralColors);

  for (let i = 0; i < count; i += 1) {
    const distance = Math.pow(Math.random(), 0.25) * radius + 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(randomRange(-1, 1));
    const size = randomRange(0.45, 2.4) * (Math.random() > 0.992 ? 4 : 1);
    matrix.compose(
      new THREE.Vector3(distance * Math.sin(phi) * Math.cos(theta), distance * Math.cos(phi), distance * Math.sin(phi) * Math.sin(theta)),
      new THREE.Quaternion(),
      new THREE.Vector3(size, size, size)
    );
    stars.setMatrixAt(i, matrix);
    color.copy(spectralColors[types[Math.floor(Math.random() * types.length)]]).multiplyScalar(randomRange(0.55, 1.85));
    stars.setColorAt(i, color);
  }
  stars.userData.description = "50,000 instanced stars with varied spectral-class colors, luminosity, and distance.";
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

function makeLine(points, color = 0x4cc9f0, opacity = 0.42) {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending }));
}

function makeCircle(radius, color = 0x4cc9f0, opacity = 0.2, segments = 256) {
  const points = Array.from({ length: segments }, (_, index) => {
    const angle = index / segments * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  });
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function makeTextSprite(lines, color = "#f8f9fa") {
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 1024;
  canvas2d.height = 512;
  const context = canvas2d.getContext("2d");
  context.clearRect(0, 0, canvas2d.width, canvas2d.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(76,201,240,0.8)";
  context.shadowBlur = 24;
  context.fillStyle = color;
  context.font = "700 82px system-ui, sans-serif";
  context.fillText(lines[0], 512, 190);
  context.font = "500 46px system-ui, sans-serif";
  context.fillText(lines[1], 512, 292);
  const texture = new THREE.CanvasTexture(canvas2d);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending }));
  sprite.scale.set(74, 37, 1);
  return sprite;
}


function drawBlob(context, points, fill, stroke = "rgba(255,255,255,0.16)") {
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.closePath();
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = 2;
  context.stroke();
}

function createEarthTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 2048;
  textureCanvas.height = 1024;
  const context = textureCanvas.getContext("2d");
  const ocean = context.createLinearGradient(0, 0, 0, textureCanvas.height);
  ocean.addColorStop(0, "#051b55");
  ocean.addColorStop(0.52, "#073d86");
  ocean.addColorStop(1, "#020d32");
  context.fillStyle = ocean;
  context.fillRect(0, 0, textureCanvas.width, textureCanvas.height);

  // Broad continent shapes are hand-drawn on an equirectangular map so the globe
  // reads as Earth without needing any network image assets.
  drawBlob(context, [[960,200],[1130,170],[1320,235],[1450,330],[1390,470],[1240,520],[1100,470],[980,360]], "#6f8f42"); // Eurasia
  drawBlob(context, [[1140,395],[1260,430],[1320,570],[1265,760],[1120,690],[1080,520]], "#b98954"); // Africa
  drawBlob(context, [[710,235],[820,270],[875,420],[815,570],[700,505],[640,360]], "#2f7b45"); // North America
  drawBlob(context, [[850,560],[930,650],[900,830],[820,935],[770,760]], "#477d3f"); // South America
  drawBlob(context, [[1500,560],[1605,620],[1580,735],[1465,700]], "#b98b4d"); // Australia
  drawBlob(context, [[960,130],[1230,115],[1430,165],[1320,210],[1030,205]], "#f4f6f8", "rgba(255,255,255,0.35)"); // Arctic
  drawBlob(context, [[885,720],[1040,730],[1120,805],[980,850],[865,800]], "#f8f9fa", "rgba(255,255,255,0.28)"); // Antarctica hint

  // Desert and mountain bands, including an Asia/Africa-facing look like the reference.
  context.globalAlpha = 0.72;
  drawBlob(context, [[1070,360],[1280,345],[1395,405],[1320,482],[1120,450]], "#d7ad72", "rgba(255,255,255,0.08)");
  drawBlob(context, [[1010,455],[1130,465],[1195,570],[1130,650],[1060,560]], "#c8965f", "rgba(255,255,255,0.06)");
  drawBlob(context, [[770,315],[830,335],[850,500],[800,535],[745,430]], "#d0b06f", "rgba(255,255,255,0.06)");
  context.globalAlpha = 1;

  // Fine procedural terrain noise and shallow-water coast glow.
  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * textureCanvas.width;
    const y = Math.random() * textureCanvas.height;
    const hue = Math.random() > 0.45 ? "rgba(246,235,190,0.10)" : "rgba(20,80,32,0.13)";
    context.fillStyle = hue;
    context.fillRect(x, y, randomRange(1, 7), randomRange(1, 3));
  }
  for (let i = 0; i < 2200; i += 1) {
    context.fillStyle = "rgba(80,210,230,0.18)";
    context.beginPath();
    context.arc(randomRange(0, textureCanvas.width), randomRange(210, 760), randomRange(0.4, 1.8), 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createCloudTexture() {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 2048;
  textureCanvas.height = 1024;
  const context = textureCanvas.getContext("2d");
  context.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
  for (let i = 0; i < 520; i += 1) {
    const x = randomRange(0, textureCanvas.width);
    const y = randomRange(120, 900);
    const width = randomRange(42, 190);
    const height = randomRange(5, 24);
    const gradient = context.createRadialGradient(x, y, 0, x, y, width);
    gradient.addColorStop(0, "rgba(255,255,255,0.58)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.22)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(x, y, width, height, randomRange(-0.4, 0.4), 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRealisticEarth(radius, showCityMarker = false) {
  const group = new THREE.Group();
  const earthMaterial = new THREE.MeshStandardMaterial({
    map: createEarthTexture(),
    roughness: 0.92,
    metalness: 0.01,
    emissive: 0x02091c,
    emissiveIntensity: 0.12
  });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 160, 96), earthMaterial);
  earth.rotation.y = -0.9;
  earth.name = "earthSurface";
  group.add(earth);

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.012, 160, 96),
    new THREE.MeshStandardMaterial({ map: createCloudTexture(), transparent: true, opacity: 0.42, depthWrite: false })
  );
  clouds.name = "earthClouds";
  clouds.rotation.y = -0.72;
  group.add(clouds);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.045, 128, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { glowColor: { value: new THREE.Color(0x4cc9f0) } },
      vertexShader: "varying vec3 vNormal; void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "varying vec3 vNormal; uniform vec3 glowColor; void main(){ float rim = pow(1.0 - abs(vNormal.z), 2.7); gl_FragColor = vec4(glowColor, rim * 0.38); }"
    })
  );
  group.add(atmosphere);

  if (showCityMarker) {
    const cityMarker = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.018, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    cityMarker.position.set(radius * 0.32, radius * 0.82, radius * 0.48);
    group.add(cityMarker);
  }
  group.userData.earth = earth;
  group.userData.clouds = clouds;
  return group;
}

function createHumanLayer() {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xc58d6a, roughness: 0.7, metalness: 0.02 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x1c1210, roughness: 0.8 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0x18263d, roughness: 0.55, metalness: 0.08 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x121722, roughness: 0.72 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x07090f, roughness: 0.65 });
  const glow = new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending });

  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.42, 8, 18), pants);
  hips.position.y = 1.05;
  hips.scale.set(1.15, 0.75, 0.62);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.0, 10, 24), shirt);
  torso.position.y = 1.68;
  torso.scale.set(1.0, 1.05, 0.52);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 24), skin);
  neck.position.y = 2.28;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 42, 24), skin);
  head.position.y = 2.57;
  head.scale.set(0.82, 1.05, 0.78);
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.292, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.54), hair);
  hairCap.position.y = 2.68;
  hairCap.scale.set(0.84, 0.56, 0.8);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 12), skin);
  nose.position.set(0, 2.56, 0.24);
  nose.rotation.x = Math.PI / 2;
  group.add(hips, torso, neck, head, hairCap, nose);

  [[-0.46, 1.86, -0.18], [0.46, 1.86, 0.18]].forEach(([x, y, zRot], side) => {
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.62, 8, 16), shirt);
    upper.position.set(x, y - 0.18, 0);
    upper.rotation.z = zRot;
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.58, 8, 16), skin);
    forearm.position.set(x + (side === 0 ? -0.11 : 0.11), y - 0.72, 0.02);
    forearm.rotation.z = zRot * 0.45;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 18, 10), skin);
    hand.position.set(x + (side === 0 ? -0.16 : 0.16), y - 1.08, 0.03);
    hand.scale.set(0.8, 1.05, 0.55);
    group.add(upper, forearm, hand);
  });

  [[-0.18, 0.52, 0.05], [0.18, 0.52, -0.05]].forEach(([x, y, zRot], side) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.74, 8, 16), pants);
    thigh.position.set(x, y + 0.17, 0);
    thigh.rotation.z = zRot;
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.68, 8, 16), pants);
    shin.position.set(x + (side === 0 ? -0.03 : 0.03), y - 0.42, 0);
    shin.rotation.z = -zRot * 0.5;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.46), shoe);
    foot.position.set(x + (side === 0 ? -0.05 : 0.05), 0.08, 0.12);
    group.add(thigh, shin, foot);
  });

  const aura = new THREE.Mesh(new THREE.CapsuleGeometry(0.68, 1.75, 8, 18), glow);
  aura.position.y = 1.48;
  group.add(aura);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(5.5, 96), new THREE.MeshStandardMaterial({ color: 0x080d16, roughness: 0.85, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);
  for (let i = -4; i <= 4; i += 1) {
    group.add(makeLine([new THREE.Vector3(i, 0.012, -5), new THREE.Vector3(i, 0.012, 5)], 0x4cc9f0, 0.08));
    group.add(makeLine([new THREE.Vector3(-5, 0.012, i), new THREE.Vector3(5, 0.012, i)], 0x4cc9f0, 0.08));
  }
  return group;
}

function createBuildingLayer() {
  const group = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.BoxGeometry(7, 42, 7), new THREE.MeshStandardMaterial({ color: 0x101826, metalness: 0.55, roughness: 0.28 }));
  tower.position.y = 21;
  group.add(tower);
  const windowGeometry = new THREE.BoxGeometry(0.28, 0.22, 0.035);
  const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.78 });
  const windows = new THREE.InstancedMesh(windowGeometry, windowMaterial, 392);
  const matrix = new THREE.Matrix4();
  let cursor = 0;
  for (let side = 0; side < 4; side += 1) {
    for (let floor = 0; floor < 28; floor += 1) {
      for (let col = -3; col <= 3; col += 1) {
        if (Math.random() < 0.42) continue;
        const y = 2 + floor * 1.36;
        const x = side < 2 ? col * 0.78 : (side === 2 ? 3.52 : -3.52);
        const z = side < 2 ? (side === 0 ? 3.52 : -3.52) : col * 0.78;
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, side < 2 ? 0 : Math.PI / 2, 0));
        matrix.compose(new THREE.Vector3(x, y, z), rotation, new THREE.Vector3(1, 1, 1));
        windows.setMatrixAt(cursor, matrix);
        cursor += 1;
      }
    }
  }
  windows.count = cursor;
  group.add(windows);
  const tinyHuman = createHumanLayer();
  tinyHuman.scale.setScalar(0.12);
  tinyHuman.position.set(-7, 0, 4);
  group.add(tinyHuman);
  return group;
}

function createCityLayer() {
  const group = new THREE.Group();
  const roadMaterial = new THREE.LineBasicMaterial({ color: 0xdde7ff, transparent: true, opacity: 0.2 });
  for (let i = -8; i <= 8; i += 1) {
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 6, 0.05, -54), new THREE.Vector3(i * 6, 0.05, 54)]), roadMaterial));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-54, 0.05, i * 6), new THREE.Vector3(54, 0.05, i * 6)]), roadMaterial));
  }
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x172338, roughness: 0.5, metalness: 0.28, emissive: 0x0d1b2a, emissiveIntensity: 0.3 });
  const buildings = new THREE.InstancedMesh(buildingGeometry, buildingMaterial, 420);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < buildings.count; i += 1) {
    const x = randomRange(-48, 48);
    const z = randomRange(-48, 48);
    const height = randomRange(1.5, 18) * (Math.random() > 0.92 ? 1.7 : 1);
    matrix.compose(new THREE.Vector3(x, height / 2, z), new THREE.Quaternion(), new THREE.Vector3(randomRange(1, 3.5), height, randomRange(1, 3.5)));
    buildings.setMatrixAt(i, matrix);
  }
  group.add(buildings);
  const park = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.MeshStandardMaterial({ color: 0x12351f, roughness: 0.9 }));
  park.rotation.x = -Math.PI / 2;
  park.position.set(-18, 0.03, 20);
  group.add(park);
  const riverPoints = Array.from({ length: 80 }, (_, i) => new THREE.Vector3(-56 + i * 1.4, 0.08, Math.sin(i * 0.18) * 9 - 12));
  group.add(makeLine(riverPoints, 0x4cc9f0, 0.55));
  return group;
}

function createEarthLayer() {
  const group = createRealisticEarth(12, true);
  group.name = "photorealisticProceduralEarth";
  return group;
}

function createEarthMoonLayer() {
  const group = new THREE.Group();
  const earthSystem = createRealisticEarth(4.2, false);
  earthSystem.position.x = 0;
  group.add(earthSystem);

  const orbit = makeCircle(46, 0x4cc9f0, 0.22, 360);
  group.add(orbit);

  const moonOrbit = new THREE.Group();
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 64, 32),
    new THREE.MeshStandardMaterial({ color: 0xb8c0ca, roughness: 1, metalness: 0.01 })
  );
  moon.position.x = 46;
  const moonGlow = new THREE.Mesh(new THREE.SphereGeometry(1.22, 32, 16), new THREE.MeshBasicMaterial({ color: 0xdde7ff, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending }));
  moonGlow.position.copy(moon.position);
  moonOrbit.add(moon, moonGlow);
  group.add(moonOrbit);

  const distanceLine = makeLine([new THREE.Vector3(0, 0, 0), new THREE.Vector3(46, 0, 0)], 0x4cc9f0, 0.18);
  group.add(distanceLine);
  group.userData.earthSystem = earthSystem;
  group.userData.moonOrbit = moonOrbit;
  group.userData.distanceLine = distanceLine;
  return group;
}

function createSolarSystemLayer() {
  const group = new THREE.Group();
  const sun = new THREE.Mesh(new THREE.SphereGeometry(5.4, 96, 48), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  group.add(sun);
  const planetColors = [0x9e8f73, 0xcaa56a, 0x4cc9f0, 0xd95f45, 0xd2a85f, 0xd8c79f, 0x80c7ff, 0x3e71d8];
  planetColors.forEach((color, index) => {
    const radius = 10 + index * 6.5 + (index > 3 ? index * 3 : 0);
    group.add(makeCircle(radius, 0x4cc9f0, 0.14));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(index < 4 ? 0.48 : 0.9, 24, 12), new THREE.MeshBasicMaterial({ color }));
    const angle = index * 0.72;
    planet.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(planet);
  });
  const asteroidBelt = createPoints(3500, 42, 0xa99a86, 0xffffff, { flatten: 0.03, size: 0.06, opacity: 0.58 });
  group.add(asteroidBelt);
  const kuiper = createPoints(4200, 78, 0x9bdfff, 0xf8f9fa, { shell: true, flatten: 0.08, size: 0.09, opacity: 0.32 });
  group.add(kuiper);
  return group;
}

function createOortLayer() {
  const group = new THREE.Group();
  const sunMarker = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  group.add(sunMarker);
  group.add(createPoints(18000, 95, 0x4cc9f0, 0xf8f9fa, { shell: true, size: 0.12, opacity: 0.5 }));
  const shell = new THREE.Mesh(new THREE.SphereGeometry(96, 64, 32), new THREE.MeshBasicMaterial({ color: 0x4cc9f0, wireframe: true, transparent: true, opacity: 0.035 }));
  group.add(shell);
  return group;
}

function createNearestStarsLayer() {
  const group = new THREE.Group();
  group.add(createInstancedStarField(50000, 640));
  const namedStars = [
    ["Solar System", 0xffd166, 0, 0, 0, 1.2],
    ["Alpha Centauri", 0xffd166, 95, 22, -54, 2.8],
    ["Barnard's Star", 0xff6b5d, -132, -18, 66, 1.8],
    ["Sirius", 0xd9f7ff, 180, 46, 108, 3.6],
    ["Wolf 359", 0xff6b5d, -80, 58, -168, 1.4]
  ];
  namedStars.forEach(([, color, x, y, z, size], index) => {
    const star = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 16), new THREE.MeshBasicMaterial({ color }));
    star.position.set(x, y, z);
    group.add(star);
    if (index > 0) group.add(makeLine([new THREE.Vector3(0, 0, 0), star.position], 0x4cc9f0, 0.1));
  });
  return group;
}

function createOrionArmLayer() {
  const group = new THREE.Group();
  const arm = buildGalaxyParticles(22000, 240, 0x9bdfff, 0xf8f9fa, 2);
  arm.scale.set(1.8, 0.16, 0.42);
  group.add(arm);
  for (let i = 0; i < 6; i += 1) {
    const nebula = createPoints(1800, randomRange(12, 26), 0x6a4c93, 0x4cc9f0, { size: 0.35, opacity: 0.33, flatten: 0.55 });
    nebula.position.set(randomRange(-180, 180), randomRange(-14, 14), randomRange(-55, 55));
    group.add(nebula);
  }
  const solarMarker = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  solarMarker.position.set(78, 0, -16);
  group.add(solarMarker);
  return group;
}

function createMilkyWayLayer() {
  const group = new THREE.Group();
  const galaxy = buildGalaxyParticles(42000, 210, 0xf8f9fa, 0x6a4c93, 5);
  galaxy.rotation.x = 1.15;
  group.add(galaxy);
  const bulge = new THREE.Mesh(new THREE.SphereGeometry(18, 64, 32), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending }));
  group.add(bulge);
  for (let i = 0; i < 5; i += 1) {
    const dust = buildGalaxyParticles(2500, 170, 0x05070b, 0x1b1029, 5);
    dust.material.size = 1.4;
    dust.material.opacity = 0.32;
    dust.rotation.x = 1.15;
    dust.rotation.z = i * 0.28;
    group.add(dust);
  }
  return group;
}

function createLocalGroupLayer() {
  const group = new THREE.Group();
  const galaxies = [
    [-50, 0, 0, 46, 0xf8f9fa, 0x6a4c93, 5],
    [70, 12, -28, 58, 0xdde7ff, 0x4cc9f0, 4],
    [18, -20, 62, 25, 0xffd166, 0xf8f9fa, 3]
  ];
  galaxies.forEach(([x, y, z, radius, a, b, arms]) => {
    const galaxy = buildGalaxyParticles(9000, radius, a, b, arms);
    galaxy.rotation.x = randomRange(0.7, 1.4);
    galaxy.rotation.z = randomRange(0, Math.PI);
    galaxy.position.set(x, y, z);
    group.add(galaxy);
  });
  group.add(createPoints(80, 150, 0xf8f9fa, 0x9bdfff, { size: 0.9, opacity: 0.35 }));
  return group;
}

function createVirgoClusterLayer() {
  const group = new THREE.Group();
  const galaxyGeometry = new THREE.SphereGeometry(0.8, 10, 6);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 });
  const mesh = new THREE.InstancedMesh(galaxyGeometry, material, 620);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  for (let i = 0; i < mesh.count; i += 1) {
    const r = Math.pow(Math.random(), 0.48) * 170;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(randomRange(-1, 1));
    const size = randomRange(0.55, 3.4);
    matrix.compose(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.65, r * Math.sin(phi) * Math.sin(theta)), new THREE.Quaternion(), new THREE.Vector3(size, size * 0.45, size));
    mesh.setMatrixAt(i, matrix);
    color.set(Math.random() > 0.7 ? 0xffd166 : 0xdde7ff).multiplyScalar(randomRange(0.6, 1.4));
    mesh.setColorAt(i, color);
  }
  group.add(mesh);
  return group;
}

function createNetworkLayer(nodeCount, radius, color = 0x4cc9f0, connections = 110) {
  const group = new THREE.Group();
  const nodes = [];
  const nodeGeometry = new THREE.SphereGeometry(1, 12, 8);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  const nodeMesh = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < nodeCount; i += 1) {
    const p = new THREE.Vector3(randomRange(-radius, radius), randomRange(-radius * 0.42, radius * 0.42), randomRange(-radius, radius));
    nodes.push(p);
    const size = randomRange(0.8, 3.6) * (Math.random() > 0.88 ? 2.2 : 1);
    matrix.compose(p, new THREE.Quaternion(), new THREE.Vector3(size, size, size));
    nodeMesh.setMatrixAt(i, matrix);
  }
  group.add(nodeMesh);
  for (let i = 0; i < connections; i += 1) {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a.distanceTo(b) < radius * 0.72) group.add(makeLine([a, b], color, randomRange(0.08, 0.32)));
  }
  return group;
}

function createLaniakeaLayer() {
  const group = createNetworkLayer(170, 180, 0xffd166, 150);
  group.add(createPoints(2600, 210, 0x6a4c93, 0x4cc9f0, { size: 0.28, opacity: 0.18 }));
  return group;
}

function createCosmicWebLayer() {
  const group = createNetworkLayer(360, 230, 0x4cc9f0, 430);
  for (let i = 0; i < 8; i += 1) {
    const voidShell = new THREE.Mesh(new THREE.SphereGeometry(randomRange(18, 42), 32, 16), new THREE.MeshBasicMaterial({ color: 0x05070b, transparent: true, opacity: 0.18, wireframe: true }));
    voidShell.position.set(randomRange(-180, 180), randomRange(-70, 70), randomRange(-180, 180));
    group.add(voidShell);
  }
  return group;
}

function createObservableUniverseLayer() {
  const group = new THREE.Group();
  const web = createNetworkLayer(480, 145, 0x9bdfff, 520);
  web.scale.set(0.72, 0.72, 0.72);
  group.add(web);
  const horizon = new THREE.Mesh(new THREE.SphereGeometry(122, 96, 48), new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.045, wireframe: true, blending: THREE.AdditiveBlending }));
  group.add(horizon);
  const label = makeTextSprite(["Observable Universe", "93 Billion Light Years"]);
  label.position.set(0, 92, 0);
  group.add(label);
  return group;
}

function buildCosmicScaleScene() {
  const builders = [
    createHumanLayer,
    createBuildingLayer,
    createCityLayer,
    createEarthLayer,
    createEarthMoonLayer,
    createSolarSystemLayer,
    createOortLayer,
    createNearestStarsLayer,
    createOrionArmLayer,
    createMilkyWayLayer,
    createLocalGroupLayer,
    createVirgoClusterLayer,
    createLaniakeaLayer,
    createCosmicWebLayer,
    createObservableUniverseLayer
  ];

  scaleObjects.layers = builders.map((builder, index) => {
    const layer = prepareLayerObject(builder());
    layer.name = `Scale layer ${index + 1}: ${scaleLevels[index].name}`;
    setLayerOpacity(layer, index === state.cameraRig.zoom ? 1 : 0);
    groups.scale.add(layer);
    return layer;
  });

  const light = new THREE.DirectionalLight(0xffffff, 2.8);
  light.position.set(-20, 36, 24);
  groups.scale.add(light, new THREE.AmbientLight(0x9bdfff, 0.42));
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
  controls.enableZoom = mode !== "scale";

  if (mode === "scale") {
    camera.position.set(0, 1.65, 4.2);
    controls.target.set(0, 1.35, 0);
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

const scaleCameraFrames = [
  { position: new THREE.Vector3(0, 1.65, 4.2), target: new THREE.Vector3(0, 1.35, 0), fov: 50 },
  { position: new THREE.Vector3(17, 24, 46), target: new THREE.Vector3(0, 21, 0), fov: 54 },
  { position: new THREE.Vector3(0, 96, 92), target: new THREE.Vector3(0, 0, 0), fov: 58 },
  { position: new THREE.Vector3(0, 8, 38), target: new THREE.Vector3(0, 0, 0), fov: 48 },
  { position: new THREE.Vector3(0, 26, 124), target: new THREE.Vector3(0, 0, 0), fov: 42 },
  { position: new THREE.Vector3(0, 82, 168), target: new THREE.Vector3(0, 0, 0), fov: 54 },
  { position: new THREE.Vector3(0, 30, 218), target: new THREE.Vector3(0, 0, 0), fov: 60 },
  { position: new THREE.Vector3(0, 155, 420), target: new THREE.Vector3(0, 4, 0), fov: 58 },
  { position: new THREE.Vector3(0, 190, 380), target: new THREE.Vector3(0, 0, 0), fov: 56 },
  { position: new THREE.Vector3(0, 280, 430), target: new THREE.Vector3(0, 0, 0), fov: 52 },
  { position: new THREE.Vector3(0, 150, 250), target: new THREE.Vector3(0, 0, 0), fov: 62 },
  { position: new THREE.Vector3(0, 180, 310), target: new THREE.Vector3(0, 0, 0), fov: 64 },
  { position: new THREE.Vector3(0, 190, 330), target: new THREE.Vector3(0, 0, 0), fov: 62 },
  { position: new THREE.Vector3(0, 210, 360), target: new THREE.Vector3(0, 0, 0), fov: 65 },
  { position: new THREE.Vector3(0, 180, 315), target: new THREE.Vector3(0, 20, 0), fov: 68 }
];

function interpolateScaleFrame(zoom) {
  const lower = Math.floor(THREE.MathUtils.clamp(zoom, 0, scaleCameraFrames.length - 1));
  const upper = Math.min(scaleCameraFrames.length - 1, lower + 1);
  const mix = THREE.MathUtils.smoothstep(zoom - lower, 0, 1);
  return {
    position: scaleCameraFrames[lower].position.clone().lerp(scaleCameraFrames[upper].position, mix),
    target: scaleCameraFrames[lower].target.clone().lerp(scaleCameraFrames[upper].target, mix),
    fov: THREE.MathUtils.lerp(scaleCameraFrames[lower].fov, scaleCameraFrames[upper].fov, mix)
  };
}

function spinEarthSystem(layer, surfaceSpeed, cloudSpeed) {
  if (!layer?.userData) return;
  const earth = layer.userData.earth || layer.userData.earthSystem?.userData.earth;
  const clouds = layer.userData.clouds || layer.userData.earthSystem?.userData.clouds;
  if (earth) earth.rotation.y += surfaceSpeed;
  if (clouds) clouds.rotation.y += cloudSpeed;
}

function animateScaleLayers(delta, zoom) {
  spinEarthSystem(scaleObjects.layers[3], delta * 0.12, delta * 0.17);
  spinEarthSystem(scaleObjects.layers[4], delta * 0.08, delta * 0.12);
  if (scaleObjects.layers[4]?.userData?.moonOrbit) scaleObjects.layers[4].userData.moonOrbit.rotation.y += delta * 0.22;
  if (scaleObjects.layers[5]) scaleObjects.layers[5].rotation.y += delta * 0.035;
  if (scaleObjects.layers[8]) scaleObjects.layers[8].rotation.y += delta * 0.012;
  if (scaleObjects.layers[9]) scaleObjects.layers[9].rotation.y += delta * 0.024;
  if (scaleObjects.layers[13]) scaleObjects.layers[13].rotation.y += delta * 0.01;
  if (scaleObjects.layers[14]) scaleObjects.layers[14].rotation.y += delta * 0.006;

  scaleObjects.layers.forEach((layer, index) => {
    const distanceFromLevel = Math.abs(zoom - index);
    const opacity = THREE.MathUtils.smoothstep(1.15 - distanceFromLevel, 0, 1);
    setLayerOpacity(layer, opacity);
    layer.scale.setScalar(1 + Math.max(0, distanceFromLevel - 0.15) * 0.025);
  });
}

function updateScaleExplorer(delta) {
  state.cameraRig.targetZoom = Number(ui.scaleZoom.value);
  const spring = (state.cameraRig.targetZoom - state.cameraRig.zoom) * 7.5;
  state.cameraRig.velocity.x += spring * delta;
  state.cameraRig.velocity.x *= Math.pow(0.0008, delta);
  state.cameraRig.zoom = THREE.MathUtils.clamp(state.cameraRig.zoom + state.cameraRig.velocity.x * delta, 0, scaleLevels.length - 1);

  const exactIndex = THREE.MathUtils.clamp(Math.round(state.cameraRig.zoom), 0, scaleLevels.length - 1);
  const level = scaleLevels[exactIndex];
  const frame = interpolateScaleFrame(state.cameraRig.zoom);

  camera.position.lerp(frame.position, 0.08);
  controls.target.lerp(frame.target, 0.08);
  camera.fov = THREE.MathUtils.lerp(camera.fov, frame.fov, 0.06);
  camera.near = 0.01;
  camera.far = 250000;
  camera.updateProjectionMatrix();
  animateScaleLayers(delta, state.cameraRig.zoom);

  ui.scaleName.textContent = level.name;
  ui.scaleDistance.textContent = level.realDiameter;
  ui.scaleBrief.textContent = `${level.description} ${level.scientificFact}`;
  ui.telemetryPrimary.textContent = level.name;
  ui.telemetryValue.textContent = `${level.realDiameter} • ${level.realDistance}`;
  ui.telemetryPhysics.textContent = `Layer ${exactIndex + 1}/15 • ${level.type} • logarithmic transition`;
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

const activePointers = new Map();
let lastPinchDistance = null;

function setScaleTargetZoom(value) {
  state.cameraRig.targetZoom = THREE.MathUtils.clamp(value, 0, scaleLevels.length - 1);
  ui.scaleZoom.value = state.cameraRig.targetZoom;
}

function getPinchDistance() {
  const pointers = [...activePointers.values()];
  if (pointers.length < 2) return null;
  const [first, second] = pointers;
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function handlePointerDown(event) {
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (activePointers.size === 2) lastPinchDistance = getPinchDistance();
}

function handlePointerMove(event) {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (state.mode !== "scale" || activePointers.size < 2) return;
  const nextDistance = getPinchDistance();
  if (!nextDistance || !lastPinchDistance) {
    lastPinchDistance = nextDistance;
    return;
  }
  const pinchDelta = lastPinchDistance - nextDistance;
  setScaleTargetZoom(state.cameraRig.targetZoom + pinchDelta * 0.012);
  lastPinchDistance = nextDistance;
}

function handlePointerEnd(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) lastPinchDistance = null;
}

function connectEvents() {
  ui.modeButtons.forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  ui.scaleZoom.addEventListener("input", () => { state.cameraRig.targetZoom = Number(ui.scaleZoom.value); });
  window.addEventListener("wheel", event => {
    if (state.mode !== "scale") return;
    setScaleTargetZoom(state.cameraRig.targetZoom + event.deltaY * 0.0025);
  }, { passive: true });
  renderer.domElement.addEventListener("pointerdown", handlePointerDown);
  renderer.domElement.addEventListener("pointermove", handlePointerMove);
  renderer.domElement.addEventListener("pointerup", handlePointerEnd);
  renderer.domElement.addEventListener("pointercancel", handlePointerEnd);
  renderer.domElement.addEventListener("lostpointercapture", handlePointerEnd);
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
