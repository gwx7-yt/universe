import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const canvas = document.querySelector("#cosmosCanvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070b, 0.00018);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.01, 250000);
camera.position.set(0, 1.65, 4.2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.enableZoom = false;
controls.minDistance = 0.25;
controls.maxDistance = 120000;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.08;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.78, 0.45, 0.16);
composer.addPass(bloomPass);

const ui = {
  loading: document.querySelector("#loadingScreen"),
  scaleZoom: document.querySelector("#scaleZoom"),
  scaleName: document.querySelector("#scaleName"),
  scaleReference: document.querySelector("#scaleReference"),
  scaleMetricLabel: document.querySelector("#scaleMetricLabel"),
  scaleMetric: document.querySelector("#scaleMetric"),
  scaleLocation: document.querySelector("#scaleLocation"),
  scaleOrder: document.querySelector("#scaleOrder"),
  scaleBrief: document.querySelector("#scaleBrief"),
  perspectiveText: document.querySelector("#perspectiveText"),
  journeySteps: document.querySelector("#journeySteps"),
  journeyProgress: document.querySelector("#journeyProgress")
};

const scaleLevels = [
  {
    name: "Human",
    reference: "Ram",
    metricLabel: "Approx. height",
    metric: "1.7 m",
    scientificScaleMeters: 1.7,
    location: "Nepal",
    description: "Ram is a human-scale reference. The figure is illustrative; the stated height is an ordinary adult reference, not a universal human average.",
    perspective: "A person is large on a personal scale, yet only about 10⁰ meters tall on a planet 10⁷ meters wide.",
    graphic: "people",
    type: "personal scale"
  },
  {
    name: "Landmark",
    reference: "Dharahara",
    metricLabel: "Height",
    metric: "~72 m",
    scientificScaleMeters: 72,
    location: "Kathmandu, Nepal",
    description: "Dharahara is shown as an architectural-scale reference; its modern reconstructed tower is about 72 meters tall.",
    perspective: "Dharahara feels tall from the street, yet it is still hundreds of times shorter than the Kármán line at 100 km.",
    graphic: "tower",
    type: "landmark scale"
  },
  {
    name: "City",
    reference: "Kathmandu Metropolitan City",
    metricLabel: "Municipal area",
    metric: "~49.45 km²",
    scientificScaleMeters: 8_000,
    location: "Kathmandu Valley, Nepal",
    description: "Kathmandu is represented as an abstract city footprint, not a literal map; its municipality covers about 49.45 square kilometers.",
    perspective: "Light crosses an 8 km city span in roughly 27 microseconds, even though a city can contain a lifetime of experience.",
    graphic: "city",
    type: "geographic scale"
  },
  { name: "Earth", reference: "Planet Earth", metricLabel: "Mean diameter", metric: "12,742 km", scientificScaleMeters: 12_742_000, location: "Solar System", description: "Earth is shown with continents, clouds, polar ice, atmosphere, and a city marker; the globe is stylized but preserves planetary identity.", perspective: "Every road, temple, home, and hillside in Kathmandu becomes a tiny mark on Earth's 12,742 km-wide surface.", graphic: "people", type: "planetary scale" },
  { name: "Earth-Moon System", reference: "Earth and Moon", metricLabel: "Mean center distance", metric: "384,400 km", scientificScaleMeters: 384_400_000, location: "Near-Earth space", description: "The Earth-Moon gap is intentionally expanded on screen so both bodies remain visible, but the stated mean distance is the real center-to-center value.", perspective: "About thirty Earth diameters fit between Earth and the Moon on average.", graphic: "city", type: "orbital scale" },
  { name: "Solar System", reference: "Sun, planets, and Kuiper Belt", metricLabel: "Neptune orbit / Kuiper Belt", metric: "30 AU / ~50 AU", scientificScaleMeters: 7.48e12, location: "Sun's planetary system", description: "Planet sizes and orbit spacing are not drawn to the same scale; this view emphasizes the correct planetary order, asteroid belt, and Kuiper Belt region.", perspective: "Earth orbits at 1 AU; Neptune orbits near 30 AU, and the Kuiper Belt extends to roughly 50 AU.", graphic: "city", type: "planetary system" },
  { name: "Oort Cloud", reference: "Hypothetical comet reservoir", metricLabel: "Estimated outer extent", metric: "~100,000 AU (~1.6 ly)", scientificScaleMeters: 1.496e16, location: "Outer Solar System", description: "The Oort Cloud is rendered as sparse points, not a solid shell, because it is an inferred, extremely diffuse reservoir of icy bodies.", perspective: "The Sun does not end at a hard wall; its comet reservoir may thin outward toward interstellar space over up to about 100,000 AU.", graphic: "city", type: "solar influence" },
  { name: "Nearest Stars", reference: "Alpha Centauri system", metricLabel: "Distance from Sun", metric: "4.37 light-years", scientificScaleMeters: 4.13e16, location: "Local interstellar space", description: "The nearby-star scene marks the Sun with several bright neighbors; Alpha Centauri is the nearest star system at about 4.37 light-years.", perspective: "Light leaving the Sun today reaches Alpha Centauri more than four years later.", graphic: "city", type: "interstellar scale" },
  { name: "Orion Arm", reference: "Local (Orion-Cygnus) Arm", metricLabel: "Approx. length", metric: "~10,000 light-years", scientificScaleMeters: 9.46e19, location: "Milky Way", description: "The Sun sits in the Local, or Orion-Cygnus, Arm: a smaller spiral-arm segment containing nebulae, star-forming regions, and nearby bright stars.", perspective: "The Sun is a local grain within a stellar stream thousands of light-years long.", graphic: "city", type: "galactic neighborhood" },
  { name: "Milky Way", reference: "Home galaxy", metricLabel: "Stellar disk diameter", metric: "~100,000 light-years", scientificScaleMeters: 9.46e20, location: "Local Group", description: "The Milky Way is shown as a barred spiral galaxy with a bright central region, disk, arms, and dust lanes; it is not a single star-like object.", perspective: "Everything in the Solar System vanishes inside a galaxy containing hundreds of billions of stars.", graphic: "city", type: "galactic scale" },
  { name: "Local Group", reference: "Galaxy group", metricLabel: "Approx. diameter", metric: "~10 million light-years", scientificScaleMeters: 9.46e22, location: "Local Group", description: "The Local Group contains the Milky Way, Andromeda, Triangulum, and many dwarf galaxies spread across roughly ten million light-years.", perspective: "Even galaxies have neighbors; these islands of stars are gravitationally associated across deep time.", graphic: "city", type: "galaxy group" },
  { name: "Virgo Cluster", reference: "Nearby galaxy cluster", metricLabel: "Approx. diameter", metric: "~15 million light-years", scientificScaleMeters: 1.42e23, location: "Virgo constellation region", description: "The Virgo Cluster is represented as many separate galaxies, not one galaxy; it contains on the order of a thousand or more member galaxies.", perspective: "In a galaxy cluster, whole galaxies become individual points in a much larger gravitational structure.", graphic: "city", type: "cluster scale" },
  { name: "Laniakea Supercluster", reference: "Supercluster basin of attraction", metricLabel: "Approx. extent", metric: "~520 million light-years", scientificScaleMeters: 4.92e24, location: "Laniakea", description: "Laniakea is a gravitational basin of attraction mapped from galaxy motions, shown here as connected flows and cluster nodes rather than a bound object with a sharp edge.", perspective: "Our galaxy participates in large-scale flows within a supercluster-sized basin of matter.", graphic: "city", type: "supercluster scale" },
  { name: "Cosmic Web", reference: "Large-scale structure", metricLabel: "Typical scale", metric: "Billions of light-years", scientificScaleMeters: 1e26, location: "Observable Universe", description: "The web view uses filamentary nodes and voids inspired by cosmological simulations; it is schematic, not fantasy lightning or a literal map.", perspective: "At the largest mapped scales, galaxies trace filaments around vast underdense voids.", graphic: "city", type: "cosmic structure" },
  { name: "Observable Universe", reference: "Observable cosmic horizon", metricLabel: "Comoving diameter", metric: "~93 billion light-years", scientificScaleMeters: 8.8e26, location: "Observable universe", description: "This boundary is the observable universe—the region from which light has had time to reach us—not necessarily the entire universe.", perspective: "Everything explored here fits inside our observable horizon, while the whole universe may extend far beyond it.", graphic: "city", type: "cosmic horizon" }
];


function scientificLogProgress(levelIndex) {
  const minLog = Math.log10(scaleLevels[0].scientificScaleMeters);
  const maxLog = Math.log10(scaleLevels[scaleLevels.length - 1].scientificScaleMeters);
  const levelLog = Math.log10(scaleLevels[levelIndex].scientificScaleMeters);
  return THREE.MathUtils.clamp(((levelLog - minLog) / (maxLog - minLog)) * 100, 0, 100);
}

function formatOrderOfMagnitude(meters) {
  if (!Number.isFinite(meters) || meters <= 0) return "reference scale";
  const exponent = Math.floor(Math.log10(meters));
  return `10${toSuperscript(exponent)} m reference`;
}

function toSuperscript(value) {
  const map = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return String(value).split("").map(char => map[char] || char).join("");
}

const journeyLabels = [
  "Human",
  "Dharahara",
  "Kathmandu",
  "Earth",
  "Earth-Moon System",
  "Solar System",
  "Oort Cloud",
  "Nearest Stars",
  "Orion Arm",
  "Milky Way",
  "Local Group",
  "Virgo Cluster",
  "Laniakea Supercluster",
  "Cosmic Web",
  "Observable Universe"
];

const state = {
  clock: new THREE.Clock(),
  zoom: 0,
  targetZoom: 0,
  zoomVelocity: 0,
  activeLevel: -1
};

const scaleGroup = new THREE.Group();
const scaleObjects = { layers: [] };
scene.add(scaleGroup);

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

function rememberBaseOpacity(material) {
  if (!material) return;
  material.transparent = true;
  material.userData.baseOpacity = material.opacity ?? 1;
}

function prepareLayerObject(object) {
  object.traverse(child => {
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach(rememberBaseOpacity);
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
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: radius * 0.012, vertexColors: true, transparent: true, opacity: 0.86, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function createRamModel(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const skin = new THREE.MeshStandardMaterial({ color: 0xb98563, roughness: 0.72 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x17100e, roughness: 0.84 });
  const shirt = new THREE.MeshStandardMaterial({ color: 0xe7e0d2, roughness: 0.66 });
  const trouser = new THREE.MeshStandardMaterial({ color: 0x111621, roughness: 0.72 });
  const shoe = new THREE.MeshStandardMaterial({ color: 0x05070b, roughness: 0.65 });
  const eye = new THREE.MeshBasicMaterial({ color: 0x05070b });
  const topiBase = new THREE.MeshStandardMaterial({ color: 0xb9b1a2, roughness: 0.7 });
  const topiAccent = new THREE.MeshBasicMaterial({ color: 0xb51f35 });
  const topiBlue = new THREE.MeshBasicMaterial({ color: 0x203c7a });

  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.42, 12, 22), trouser);
  hips.position.y = 1.05;
  hips.scale.set(1.15, 0.75, 0.62);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.0, 14, 28), shirt);
  torso.position.y = 1.68;
  torso.scale.set(1.0, 1.05, 0.52);
  const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.72, 10, 18), shirt);
  shoulders.position.y = 2.05;
  shoulders.rotation.z = Math.PI / 2;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 28), skin);
  neck.position.y = 2.28;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 48, 28), skin);
  head.position.y = 2.57;
  head.scale.set(0.82, 1.05, 0.78);
  const hairBand = new THREE.Mesh(new THREE.SphereGeometry(0.286, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
  hairBand.position.y = 2.64;
  hairBand.scale.set(0.86, 0.38, 0.78);

  const topi = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.255, 0.36, 8, 1), topiBase);
  topi.position.y = 2.93;
  topi.rotation.y = Math.PI / 8;
  topi.scale.set(1, 1, 0.86);
  group.add(topi);
  for (let i = 0; i < 8; i += 1) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.34, 0.012), i % 2 ? topiAccent : topiBlue);
    const angle = i / 8 * Math.PI * 2;
    stripe.position.set(Math.cos(angle) * 0.235, 2.93, Math.sin(angle) * 0.2);
    stripe.rotation.y = -angle;
    stripe.rotation.z = i % 2 ? 0.25 : -0.25;
    group.add(stripe);
  }

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 14), skin);
  nose.position.set(0, 2.56, 0.24);
  nose.rotation.x = Math.PI / 2;
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 14, 8), eye);
  leftEye.position.set(-0.075, 2.61, 0.225);
  const rightEye = leftEye.clone();
  rightEye.position.x = 0.075;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.014, 0.01), eye);
  mouth.position.set(0, 2.46, 0.238);
  const leftEar = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 8), skin);
  leftEar.position.set(-0.245, 2.57, 0.015);
  leftEar.scale.set(0.55, 1, 0.32);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.245;
  group.add(hips, torso, shoulders, neck, head, hairBand, nose, leftEye, rightEye, mouth, leftEar, rightEar);

  [[-0.46, 1.86, -0.18], [0.46, 1.86, 0.18]].forEach(([x, y, zRot], side) => {
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.62, 10, 18), shirt);
    upper.position.set(x, y - 0.18, 0);
    upper.rotation.z = zRot;
    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.58, 10, 18), skin);
    forearm.position.set(x + (side === 0 ? -0.11 : 0.11), y - 0.72, 0.02);
    forearm.rotation.z = zRot * 0.45;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 10), skin);
    hand.position.set(x + (side === 0 ? -0.16 : 0.16), y - 1.08, 0.03);
    hand.scale.set(0.8, 1.05, 0.55);
    group.add(upper, forearm, hand);
    for (let finger = -1; finger <= 1; finger += 1) {
      const digit = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.08, 4, 8), skin);
      digit.position.set(hand.position.x + finger * 0.028, hand.position.y - 0.075, 0.055);
      digit.rotation.z = finger * 0.12;
      group.add(digit);
    }
  });

  [[-0.18, 0.52, 0.05], [0.18, 0.52, -0.05]].forEach(([x, y, zRot], side) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.74, 10, 18), trouser);
    thigh.position.set(x, y + 0.17, 0);
    thigh.rotation.z = zRot;
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.68, 10, 18), trouser);
    shin.position.set(x + (side === 0 ? -0.03 : 0.03), y - 0.42, 0);
    shin.rotation.z = -zRot * 0.5;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.46), shoe);
    foot.position.set(x + (side === 0 ? -0.05 : 0.05), 0.08, 0.12);
    group.add(thigh, shin, foot);
  });

  return group;
}

function createHumanLayer() {
  const group = new THREE.Group();
  const ram = createRamModel(1);
  group.add(ram);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(5.5, 96), new THREE.MeshStandardMaterial({ color: 0x080d16, roughness: 0.85, metalness: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);
  for (let i = -4; i <= 4; i += 1) {
    group.add(makeLine([new THREE.Vector3(i, 0.012, -5), new THREE.Vector3(i, 0.012, 5)], 0x4cc9f0, 0.08));
    group.add(makeLine([new THREE.Vector3(-5, 0.012, i), new THREE.Vector3(5, 0.012, i)], 0x4cc9f0, 0.08));
  }
  return group;
}

function createDharaharaModel(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const white = new THREE.MeshStandardMaterial({ color: 0xf0eee5, roughness: 0.56, metalness: 0.04 });
  const shadow = new THREE.MeshStandardMaterial({ color: 0xb8b1a0, roughness: 0.68 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd0aa55, roughness: 0.42, metalness: 0.16 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.25, 2.65, 2.2, 64), white);
  base.position.y = 1.1;
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.3, 0.7, 64), shadow);
  plinth.position.y = 0.35;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.45, 36, 72), white);
  shaft.position.y = 20.6;
  const observation = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.7, 4.2, 72), white);
  observation.position.y = 40.7;
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.55, 2.4, 72), white);
  crown.position.y = 44.1;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.62, 5.2, 48), gold);
  spire.position.y = 47.9;
  group.add(plinth, base, shaft, observation, crown, spire);

  [4.8, 10.5, 16.2, 21.9, 27.6, 33.3, 38.8, 42.7].forEach((height, index) => {
    const balcony = new THREE.Mesh(new THREE.TorusGeometry(index > 5 ? 1.95 : 1.34, 0.055, 10, 96), gold);
    balcony.position.y = height;
    balcony.rotation.x = Math.PI / 2;
    group.add(balcony);
  });

  for (let i = 0; i < 14; i += 1) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.035, 35, 0.035), shadow);
    const angle = i / 14 * Math.PI * 2;
    rib.position.set(Math.cos(angle) * 1.18, 20.8, Math.sin(angle) * 1.18);
    rib.rotation.y = -angle;
    group.add(rib);
  }

  return group;
}

function createLandmarkLayer() {
  const group = new THREE.Group();
  const dharahara = createDharaharaModel(1);
  group.add(dharahara);
  const tinyRam = createRamModel(0.12);
  tinyRam.position.set(-4.2, 0, 2.4);
  group.add(tinyRam);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 96), new THREE.MeshStandardMaterial({ color: 0x080d16, roughness: 0.85, metalness: 0.25 }));
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);
  const comparison = new THREE.Group();
  for (let i = 0; i < 22; i += 1) {
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.2, 0.09), new THREE.MeshBasicMaterial({ color: i === 21 ? 0x4cc9f0 : 0xffd166, transparent: true, opacity: i === 21 ? 0.5 : 0.18 }));
    ghost.position.set(5.2, 1 + i * 1.45, -2.2);
    comparison.add(ghost);
  }
  group.add(comparison);
  return group;
}

function createStupaModel(scale = 1) {
  const group = new THREE.Group();
  group.scale.setScalar(scale);
  const white = new THREE.MeshStandardMaterial({ color: 0xe9e3d2, roughness: 0.74 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd5aa42, roughness: 0.44, metalness: 0.12 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.35, 0.42, 64), white);
  base.position.y = 0.21;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.65, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), white);
  dome.position.y = 0.42;
  dome.scale.y = 0.58;
  const harmika = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.56, 0.82), white);
  harmika.position.y = 1.45;
  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.9, 4), gold);
  spire.position.y = 2.65;
  spire.rotation.y = Math.PI / 4;
  group.add(base, dome, harmika, spire);
  return group;
}

function createAirportModel() {
  const group = new THREE.Group();
  const runway = new THREE.Mesh(new THREE.BoxGeometry(18, 0.035, 2.1), new THREE.MeshStandardMaterial({ color: 0x20232a, roughness: 0.82 }));
  runway.position.y = 0.08;
  runway.rotation.y = -0.18;
  group.add(runway);
  const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xf8f3d8, transparent: true, opacity: 0.75 });
  for (let i = -7; i <= 7; i += 2) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.08), stripeMaterial);
    stripe.position.set(i, 0.13, 0);
    stripe.rotation.copy(runway.rotation);
    group.add(stripe);
  }
  const terminal = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, 1.2), new THREE.MeshStandardMaterial({ color: 0x9a9588, roughness: 0.7 }));
  terminal.position.set(0, 0.34, 2.2);
  terminal.rotation.y = -0.18;
  group.add(terminal);
  return group;
}

function createKathmanduTerrain() {
  const geometry = new THREE.PlaneGeometry(150, 112, 108, 84);
  const colors = [];
  const low = new THREE.Color(0x526b3f);
  const urban = new THREE.Color(0x7d7567);
  const ridge = new THREE.Color(0x27452d);
  const dry = new THREE.Color(0x8a7651);
  const color = new THREE.Color();
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const nx = x / 75;
    const ny = y / 56;
    const radial = Math.sqrt(nx * nx + ny * ny);
    const elliptical = Math.sqrt((x / 62) ** 2 + (y / 38) ** 2);
    const rim = THREE.MathUtils.smoothstep(elliptical, 0.54, 1.05);
    const northRidge = Math.exp(-((y - 43) ** 2) / 95) * (5.5 + 1.4 * Math.sin(x * 0.12));
    const southRidge = Math.exp(-((y + 41) ** 2) / 120) * (4.6 + 1.1 * Math.cos(x * 0.1));
    const westRidge = Math.exp(-((x + 62) ** 2) / 130) * (3.8 + 0.8 * Math.sin(y * 0.16));
    const eastRidge = Math.exp(-((x - 66) ** 2) / 145) * (3.4 + 0.8 * Math.cos(y * 0.14));
    const undulation = Math.sin(x * 0.09) * Math.cos(y * 0.11) * 0.55 + Math.sin((x + y) * 0.045) * 0.5;
    const basin = -1.6 * Math.exp(-(radial * radial) / 0.42);
    const height = basin + rim * 2.2 + northRidge + southRidge + westRidge + eastRidge + undulation;
    position.setZ(i, height);

    if (elliptical < 0.48) color.copy(urban).lerp(low, 0.18 + Math.random() * 0.08);
    else color.copy(low).lerp(ridge, Math.min(1, rim * 0.85)).lerp(dry, Math.max(0, Math.sin(x * 0.08) * 0.12));
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const terrain = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0.02 }));
  terrain.rotation.x = -Math.PI / 2;
  return terrain;
}

function createEllipseRoad(rx, rz, opacity = 0.56, color = 0xf5e6bf, y = 0.18) {
  const points = Array.from({ length: 260 }, (_, index) => {
    const angle = index / 260 * Math.PI * 2;
    const wobble = 1 + 0.035 * Math.sin(angle * 5) + 0.02 * Math.cos(angle * 9);
    return new THREE.Vector3(Math.cos(angle) * rx * wobble, y, Math.sin(angle) * rz * wobble);
  });
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}

function createKathmanduBuildingField() {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const concrete = new THREE.MeshStandardMaterial({ color: 0x8a8275, roughness: 0.82, metalness: 0.03, emissive: 0x1c130b, emissiveIntensity: 0.08 });
  const brick = new THREE.MeshStandardMaterial({ color: 0x8e6f57, roughness: 0.86, metalness: 0.02, emissive: 0x1c0f08, emissiveIntensity: 0.06 });
  const meshA = new THREE.InstancedMesh(geometry, concrete, 1150);
  const meshB = new THREE.InstancedMesh(geometry, brick, 1150);
  const matrix = new THREE.Matrix4();
  let a = 0;
  let b = 0;

  for (let i = 0; i < 1150; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.8);
    let x = Math.cos(angle) * r * randomRange(8, 47);
    let z = Math.sin(angle) * r * randomRange(6, 29);
    x += Math.sin(z * 0.16) * 4;
    if ((x / 54) ** 2 + (z / 34) ** 2 > 1) continue;
    const height = randomRange(0.34, 1.25) * (Math.random() > 0.9 ? randomRange(1.25, 2.1) : 1);
    const sx = randomRange(0.55, 1.45);
    const sz = randomRange(0.55, 1.55);
    matrix.compose(new THREE.Vector3(x, height / 2 + 0.18, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, randomRange(-0.18, 0.18), 0)), new THREE.Vector3(sx, height, sz));
    if (Math.random() > 0.36) meshA.setMatrixAt(a++, matrix);
    else meshB.setMatrixAt(b++, matrix);
  }
  meshA.count = a;
  meshB.count = b;
  group.add(meshA, meshB);
  return group;
}

function createCityLights(count = 900) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const warm = new THREE.Color(0xffc46b);
  const soft = new THREE.Color(0xf8f0d2);
  const c = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.72);
    const x = Math.cos(angle) * r * randomRange(10, 50);
    const z = Math.sin(angle) * r * randomRange(7, 31);
    positions[i * 3] = x;
    positions[i * 3 + 1] = 0.72 + Math.random() * 0.22;
    positions[i * 3 + 2] = z;
    c.copy(warm).lerp(soft, Math.random() * 0.5);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.66, depthWrite: false, blending: THREE.AdditiveBlending }));
}

function createCityLayer() {
  const group = new THREE.Group();
  group.add(createKathmanduTerrain());
  group.add(createEllipseRoad(43, 25, 0.72, 0xf6ead0, 0.2));
  group.add(createEllipseRoad(28, 16, 0.22, 0xffc46b, 0.21));

  const arterialMaterial = new THREE.LineBasicMaterial({ color: 0xf8e8c8, transparent: true, opacity: 0.5 });
  [
    [new THREE.Vector3(-55, 0.23, -4), new THREE.Vector3(-20, 0.23, -2), new THREE.Vector3(0, 0.23, 0), new THREE.Vector3(46, 0.23, 3)],
    [new THREE.Vector3(-12, 0.23, -30), new THREE.Vector3(-4, 0.23, -12), new THREE.Vector3(2, 0.23, 0), new THREE.Vector3(20, 0.23, 26)],
    [new THREE.Vector3(-40, 0.23, 18), new THREE.Vector3(-12, 0.23, 8), new THREE.Vector3(12, 0.23, -3), new THREE.Vector3(54, 0.23, -12)],
    [new THREE.Vector3(35, 0.23, -26), new THREE.Vector3(24, 0.23, -10), new THREE.Vector3(8, 0.23, 2), new THREE.Vector3(-18, 0.23, 24)]
  ].forEach(points => group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), arterialMaterial)));

  const streetMaterial = new THREE.LineBasicMaterial({ color: 0xffd79a, transparent: true, opacity: 0.17 });
  for (let i = -7; i <= 7; i += 1) {
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-36, 0.22, i * 3.2), new THREE.Vector3(0, 0.22, i * 2.6 + Math.sin(i) * 1.2), new THREE.Vector3(36, 0.22, i * 3.1)]), streetMaterial));
  }
  for (let i = -5; i <= 5; i += 1) {
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i * 6.2, 0.22, -22), new THREE.Vector3(i * 4.8 + Math.cos(i) * 1.4, 0.22, 0), new THREE.Vector3(i * 6.4, 0.22, 22)]), streetMaterial));
  }

  group.add(createKathmanduBuildingField());
  group.add(createCityLights());
  const riverPoints = Array.from({ length: 120 }, (_, i) => new THREE.Vector3(-58 + i * 0.98, 0.26, Math.sin(i * 0.13) * 4.8 - 7 + Math.cos(i * 0.05) * 2.2));
  group.add(makeLine(riverPoints, 0x78c7d8, 0.7));

  const dharahara = createDharaharaModel(0.08);
  dharahara.position.set(3.2, 0.2, 1.8);
  group.add(dharahara);
  const boudha = createStupaModel(0.82);
  boudha.position.set(24, 0.26, -10);
  group.add(boudha);
  const swayambhuHill = new THREE.Mesh(new THREE.SphereGeometry(4.4, 32, 16), new THREE.MeshStandardMaterial({ color: 0x2f4b2e, roughness: 0.9 }));
  swayambhuHill.position.set(-31, -1.9, 9);
  swayambhuHill.scale.set(1.4, 0.34, 0.9);
  group.add(swayambhuHill);
  const swayambhu = createStupaModel(0.58);
  swayambhu.position.set(-31, 1.0, 9);
  group.add(swayambhu);
  const airport = createAirportModel();
  airport.position.set(31, 0.25, 7);
  group.add(airport);

  const haze = new THREE.Mesh(new THREE.PlaneGeometry(98, 62), new THREE.MeshBasicMaterial({ color: 0xffd6a0, transparent: true, opacity: 0.055, depthWrite: false, blending: THREE.AdditiveBlending }));
  haze.rotation.x = -Math.PI / 2;
  haze.position.y = 1.25;
  group.add(haze);
  return group;
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
  drawBlob(context, [[960,200],[1130,170],[1320,235],[1450,330],[1390,470],[1240,520],[1100,470],[980,360]], "#6f8f42");
  drawBlob(context, [[1140,395],[1260,430],[1320,570],[1265,760],[1120,690],[1080,520]], "#b98954");
  drawBlob(context, [[710,235],[820,270],[875,420],[815,570],[700,505],[640,360]], "#2f7b45");
  drawBlob(context, [[850,560],[930,650],[900,830],[820,935],[770,760]], "#477d3f");
  drawBlob(context, [[1500,560],[1605,620],[1580,735],[1465,700]], "#b98b4d");
  drawBlob(context, [[960,130],[1230,115],[1430,165],[1320,210],[1030,205]], "#f4f6f8", "rgba(255,255,255,0.35)");
  context.globalAlpha = 0.72;
  drawBlob(context, [[1070,360],[1280,345],[1395,405],[1320,482],[1120,450]], "#d7ad72", "rgba(255,255,255,0.08)");
  drawBlob(context, [[1010,455],[1130,465],[1195,570],[1130,650],[1060,560]], "#c8965f", "rgba(255,255,255,0.06)");
  context.globalAlpha = 1;
  for (let i = 0; i < 9000; i += 1) {
    context.fillStyle = Math.random() > 0.45 ? "rgba(246,235,190,0.10)" : "rgba(20,80,32,0.13)";
    context.fillRect(randomRange(0, textureCanvas.width), randomRange(0, textureCanvas.height), randomRange(1, 7), randomRange(1, 3));
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
  for (let i = 0; i < 520; i += 1) {
    const x = randomRange(0, textureCanvas.width);
    const y = randomRange(120, 900);
    const width = randomRange(42, 190);
    const gradient = context.createRadialGradient(x, y, 0, x, y, width);
    gradient.addColorStop(0, "rgba(255,255,255,0.58)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.22)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(x, y, width, randomRange(5, 24), randomRange(-0.4, 0.4), 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createRealisticEarth(radius, showCityMarker = false) {
  const group = new THREE.Group();
  const earth = new THREE.Mesh(new THREE.SphereGeometry(radius, 160, 96), new THREE.MeshStandardMaterial({ map: createEarthTexture(), roughness: 0.92, metalness: 0.01, emissive: 0x02091c, emissiveIntensity: 0.12 }));
  earth.rotation.y = -0.9;
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.012, 160, 96), new THREE.MeshStandardMaterial({ map: createCloudTexture(), transparent: true, opacity: 0.42, depthWrite: false }));
  clouds.rotation.y = -0.72;
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
  group.add(earth, clouds, atmosphere);
  if (showCityMarker) {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.018, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    marker.position.set(radius * 0.32, radius * 0.82, radius * 0.48);
    group.add(marker);
  }
  group.userData.earth = earth;
  group.userData.clouds = clouds;
  return group;
}

function createEarthLayer() {
  return createRealisticEarth(12, true);
}

function createEarthMoonLayer() {
  const group = new THREE.Group();
  const earthSystem = createRealisticEarth(4.2, false);
  group.add(earthSystem);
  group.add(makeCircle(46, 0x4cc9f0, 0.22, 360));
  const moonOrbit = new THREE.Group();
  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.15, 64, 32), new THREE.MeshStandardMaterial({ color: 0xb8c0ca, roughness: 1, metalness: 0.01 }));
  moon.position.x = 46;
  moonOrbit.add(moon);
  group.add(moonOrbit, makeLine([new THREE.Vector3(0, 0, 0), new THREE.Vector3(46, 0, 0)], 0x4cc9f0, 0.18));
  group.userData.earthSystem = earthSystem;
  group.userData.moonOrbit = moonOrbit;
  return group;
}

function createSolarSystemLayer() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.SphereGeometry(5.4, 96, 48), new THREE.MeshBasicMaterial({ color: 0xffd166 })));
  [0x9e8f73, 0xcaa56a, 0x4cc9f0, 0xd95f45, 0xd2a85f, 0xd8c79f, 0x80c7ff, 0x3e71d8].forEach((color, index) => {
    const radius = 10 + index * 6.5 + (index > 3 ? index * 3 : 0);
    group.add(makeCircle(radius, 0x4cc9f0, 0.14));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(index < 4 ? 0.48 : 0.9, 24, 12), new THREE.MeshBasicMaterial({ color }));
    planet.position.set(Math.cos(index * 0.72) * radius, 0, Math.sin(index * 0.72) * radius);
    group.add(planet);
  });
  group.add(createPoints(3500, 42, 0xa99a86, 0xffffff, { flatten: 0.03, size: 0.06, opacity: 0.58 }));
  group.add(createPoints(4200, 78, 0x9bdfff, 0xf8f9fa, { shell: true, flatten: 0.08, size: 0.09, opacity: 0.32 }));
  return group;
}

function createOortLayer() {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16), new THREE.MeshBasicMaterial({ color: 0xffd166 })));
  group.add(createPoints(18000, 95, 0x4cc9f0, 0xf8f9fa, { shell: true, size: 0.12, opacity: 0.5 }));
  group.add(new THREE.Mesh(new THREE.SphereGeometry(96, 64, 32), new THREE.MeshBasicMaterial({ color: 0x4cc9f0, wireframe: true, transparent: true, opacity: 0.035 })));
  return group;
}

function createNearestStarsLayer() {
  const group = new THREE.Group();
  group.add(createInstancedStarField(50000, 640));
  [[0xffd166, 0, 0, 0, 1.2], [0xffd166, 95, 22, -54, 2.8], [0xff6b5d, -132, -18, 66, 1.8], [0xd9f7ff, 180, 46, 108, 3.6], [0xff6b5d, -80, 58, -168, 1.4]].forEach(([color, x, y, z, size], index) => {
    const light = new THREE.Mesh(new THREE.SphereGeometry(size, 32, 16), new THREE.MeshBasicMaterial({ color }));
    light.position.set(x, y, z);
    group.add(light);
    if (index > 0) group.add(makeLine([new THREE.Vector3(0, 0, 0), light.position], 0x4cc9f0, 0.1));
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
  const marker = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
  marker.position.set(78, 0, -16);
  group.add(marker);
  return group;
}

function createMilkyWayLayer() {
  const group = new THREE.Group();
  const galaxy = buildGalaxyParticles(42000, 210, 0xf8f9fa, 0x6a4c93, 5);
  galaxy.rotation.x = 1.15;
  group.add(galaxy);
  group.add(new THREE.Mesh(new THREE.SphereGeometry(18, 64, 32), new THREE.MeshBasicMaterial({ color: 0xffd166, transparent: true, opacity: 0.48, blending: THREE.AdditiveBlending })));
  return group;
}

function createLocalGroupLayer() {
  const group = new THREE.Group();
  [[-50, 0, 0, 46, 0xf8f9fa, 0x6a4c93, 5], [70, 12, -28, 58, 0xdde7ff, 0x4cc9f0, 4], [18, -20, 62, 25, 0xffd166, 0xf8f9fa, 3]].forEach(([x, y, z, radius, a, b, arms]) => {
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
  const geometry = new THREE.SphereGeometry(0.8, 10, 6);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 });
  const mesh = new THREE.InstancedMesh(geometry, material, 620);
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
  const geometry = new THREE.SphereGeometry(1, 12, 8);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  const mesh = new THREE.InstancedMesh(geometry, material, nodeCount);
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < nodeCount; i += 1) {
    const p = new THREE.Vector3(randomRange(-radius, radius), randomRange(-radius * 0.42, radius * 0.42), randomRange(-radius, radius));
    nodes.push(p);
    const size = randomRange(0.8, 3.6) * (Math.random() > 0.88 ? 2.2 : 1);
    matrix.compose(p, new THREE.Quaternion(), new THREE.Vector3(size, size, size));
    mesh.setMatrixAt(i, matrix);
  }
  group.add(mesh);
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

function makeTextSprite(lines, color = "#f8f9fa") {
  const canvas2d = document.createElement("canvas");
  canvas2d.width = 1024;
  canvas2d.height = 512;
  const context = canvas2d.getContext("2d");
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
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, blending: THREE.AdditiveBlending }));
}

function createObservableUniverseLayer() {
  const group = new THREE.Group();
  const web = createNetworkLayer(480, 145, 0x9bdfff, 520);
  web.scale.setScalar(0.72);
  group.add(web);
  group.add(new THREE.Mesh(new THREE.SphereGeometry(122, 96, 48), new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.045, wireframe: true, blending: THREE.AdditiveBlending })));
  const label = makeTextSprite(["Observable Universe", "93 Billion Light Years"]);
  label.position.set(0, 92, 0);
  label.scale.set(74, 37, 1);
  group.add(label);
  return group;
}

function buildScaleScene() {
  const builders = [createHumanLayer, createLandmarkLayer, createCityLayer, createEarthLayer, createEarthMoonLayer, createSolarSystemLayer, createOortLayer, createNearestStarsLayer, createOrionArmLayer, createMilkyWayLayer, createLocalGroupLayer, createVirgoClusterLayer, createLaniakeaLayer, createCosmicWebLayer, createObservableUniverseLayer];
  scaleObjects.layers = builders.map((builder, index) => {
    const layer = prepareLayerObject(builder());
    layer.name = `Scale layer ${index + 1}: ${scaleLevels[index].name}`;
    setLayerOpacity(layer, index === 0 ? 1 : 0);
    scaleGroup.add(layer);
    return layer;
  });
  const light = new THREE.DirectionalLight(0xffffff, 2.8);
  light.position.set(-20, 36, 24);
  scaleGroup.add(light, new THREE.AmbientLight(0x9bdfff, 0.42));
}

const cameraFrames = [
  { position: new THREE.Vector3(0, 1.65, 4.2), target: new THREE.Vector3(0, 1.35, 0), fov: 48 },
  { position: new THREE.Vector3(17, 24, 46), target: new THREE.Vector3(0, 21, 0), fov: 52 },
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

function interpolateCameraFrame(zoom) {
  const lower = Math.floor(THREE.MathUtils.clamp(zoom, 0, cameraFrames.length - 1));
  const upper = Math.min(cameraFrames.length - 1, lower + 1);
  const mix = THREE.MathUtils.smoothstep(zoom - lower, 0, 1);
  return {
    position: cameraFrames[lower].position.clone().lerp(cameraFrames[upper].position, mix),
    target: cameraFrames[lower].target.clone().lerp(cameraFrames[upper].target, mix),
    fov: THREE.MathUtils.lerp(cameraFrames[lower].fov, cameraFrames[upper].fov, mix)
  };
}

function spinEarthSystem(layer, surfaceSpeed, cloudSpeed) {
  if (!layer?.userData) return;
  const earth = layer.userData.earth || layer.userData.earthSystem?.userData.earth;
  const clouds = layer.userData.clouds || layer.userData.earthSystem?.userData.clouds;
  if (earth) earth.rotation.y += surfaceSpeed;
  if (clouds) clouds.rotation.y += cloudSpeed;
}

function animateLayers(delta) {
  spinEarthSystem(scaleObjects.layers[3], delta * 0.12, delta * 0.17);
  spinEarthSystem(scaleObjects.layers[4], delta * 0.08, delta * 0.12);
  if (scaleObjects.layers[4]?.userData?.moonOrbit) scaleObjects.layers[4].userData.moonOrbit.rotation.y += delta * 0.22;
  [5, 8, 9, 13, 14].forEach(index => {
    if (scaleObjects.layers[index]) scaleObjects.layers[index].rotation.y += delta * (index === 5 ? 0.035 : 0.012);
  });

  scaleObjects.layers.forEach((layer, index) => {
    const distanceFromLevel = Math.abs(state.zoom - index);
    const opacity = THREE.MathUtils.smoothstep(1.15 - distanceFromLevel, 0, 1);
    setLayerOpacity(layer, opacity);
    layer.scale.setScalar(1 + Math.max(0, distanceFromLevel - 0.15) * 0.025);
  });
}

function updatePanels(levelIndex) {
  if (state.activeLevel === levelIndex) return;
  state.activeLevel = levelIndex;
  const level = scaleLevels[levelIndex];
  ui.scaleName.textContent = level.name;
  ui.scaleReference.textContent = level.reference;
  ui.scaleMetricLabel.textContent = level.metricLabel;
  ui.scaleMetric.textContent = level.metric;
  ui.scaleLocation.textContent = level.location;
  ui.scaleOrder.textContent = formatOrderOfMagnitude(level.scientificScaleMeters);
  ui.scaleBrief.textContent = level.description;
  ui.perspectiveText.textContent = level.perspective;
  ui.journeyProgress.style.setProperty("--journey-progress", `${scientificLogProgress(levelIndex)}%`);
  [...ui.journeySteps.children].forEach((step, index) => {
    step.classList.toggle("active", index === levelIndex);
    step.classList.toggle("passed", index < levelIndex);
  });
  ui.perspectiveText.style.animation = "none";
  requestAnimationFrame(() => { ui.perspectiveText.style.animation = ""; });
}

function updateScaleExplorer(delta) {
  state.targetZoom = Number(ui.scaleZoom.value);
  const spring = (state.targetZoom - state.zoom) * 7.5;
  state.zoomVelocity += spring * delta;
  state.zoomVelocity *= Math.pow(0.0008, delta);
  state.zoom = THREE.MathUtils.clamp(state.zoom + state.zoomVelocity * delta, 0, scaleLevels.length - 1);

  const levelIndex = THREE.MathUtils.clamp(Math.round(state.zoom), 0, scaleLevels.length - 1);
  const frame = interpolateCameraFrame(state.zoom);
  camera.position.lerp(frame.position, 0.08);
  controls.target.lerp(frame.target, 0.08);
  camera.fov = THREE.MathUtils.lerp(camera.fov, frame.fov, 0.06);
  camera.updateProjectionMatrix();
  animateLayers(delta);
  updatePanels(levelIndex);
}

const activePointers = new Map();
let lastPinchDistance = null;

function setScaleTargetZoom(value) {
  state.targetZoom = THREE.MathUtils.clamp(value, 0, scaleLevels.length - 1);
  ui.scaleZoom.value = state.targetZoom;
}

function getPinchDistance() {
  const pointers = [...activePointers.values()];
  if (pointers.length < 2) return null;
  const [first, second] = pointers;
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function handlePointerDown(event) {
  renderer.domElement.setPointerCapture?.(event.pointerId);
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (activePointers.size === 2) {
    lastPinchDistance = getPinchDistance();
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

function handlePointerMove(event) {
  if (!activePointers.has(event.pointerId)) return;
  activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (activePointers.size < 2) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const nextDistance = getPinchDistance();
  if (!nextDistance || !lastPinchDistance) {
    lastPinchDistance = nextDistance;
    return;
  }
  const pinchDelta = lastPinchDistance - nextDistance;
  setScaleTargetZoom(state.targetZoom + pinchDelta * 0.012);
  lastPinchDistance = nextDistance;
}

function handlePointerEnd(event) {
  renderer.domElement.releasePointerCapture?.(event.pointerId);
  activePointers.delete(event.pointerId);
  if (activePointers.size < 2) lastPinchDistance = null;
}

function preventBrowserPinchZoom(event) {
  if (event.touches?.length > 1) event.preventDefault();
}

function buildJourneySteps() {
  ui.journeySteps.innerHTML = "";
  journeyLabels.forEach((label, index) => {
    const step = document.createElement("button");
    step.type = "button";
    step.className = "journey-step";
    step.textContent = label;
    step.addEventListener("click", () => setScaleTargetZoom(index));
    ui.journeySteps.appendChild(step);
  });
}

function connectEvents() {
  ui.scaleZoom.addEventListener("input", () => { state.targetZoom = Number(ui.scaleZoom.value); });
  window.addEventListener("wheel", event => {
    setScaleTargetZoom(state.targetZoom + event.deltaY * 0.0025);
  }, { passive: true });
  renderer.domElement.addEventListener("pointerdown", handlePointerDown, { capture: true });
  renderer.domElement.addEventListener("pointermove", handlePointerMove, { capture: true });
  renderer.domElement.addEventListener("pointerup", handlePointerEnd, { capture: true });
  renderer.domElement.addEventListener("pointercancel", handlePointerEnd, { capture: true });
  renderer.domElement.addEventListener("lostpointercapture", handlePointerEnd, { capture: true });
  window.addEventListener("touchmove", preventBrowserPinchZoom, { passive: false });
  window.addEventListener("gesturestart", event => event.preventDefault());
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
  updateScaleExplorer(delta);
  controls.update();
  composer.render();
}

buildScaleScene();
buildJourneySteps();
connectEvents();
updatePanels(0);
setTimeout(() => ui.loading.classList.add("hidden"), 700);
animate();
