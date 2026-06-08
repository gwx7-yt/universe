// CosmoScope uses plain JavaScript objects to store the science data.
// The functions below read that data and update the HTML when users interact.

const scaleLevels = [
  {
    name: "Human",
    size: "About 1.7 meters tall",
    explanation: "Human scale is the starting point for measurement. From here, every step outward requires much larger units.",
    comparison: "If a human were a single grain of sand, Earth would still be larger than a city block.",
    visual: { size: 46, radius: "36% 36% 45% 45%", bg: "linear-gradient(180deg, #eaf7ff, #4de8ff)", glow: "rgba(77,232,255,0.55)", ring: 0.1 }
  },
  {
    name: "Earth",
    size: "Diameter: about 12,742 km",
    explanation: "Earth is a rocky planet with oceans, atmosphere, and a magnetic field. Its size is enormous compared with a person but tiny compared with the Solar System.",
    comparison: "If Earth were the size of a marble, a person would be smaller than a dust speck on its surface.",
    visual: { size: 112, radius: "50%", bg: "radial-gradient(circle at 35% 30%, #9ff6ff, #1269c7 43%, #082c5d 70%)", glow: "rgba(77,232,255,0.55)", ring: 0.25 }
  },
  {
    name: "Solar System",
    size: "Diameter: roughly 287 billion km to Neptune's orbit",
    explanation: "The Solar System includes the Sun, planets, moons, asteroids, comets, and large regions of mostly empty space.",
    comparison: "If Earth were the size of a marble, the Solar System would stretch far beyond a football field.",
    visual: { size: 70, radius: "50%", bg: "radial-gradient(circle, #fff8c7, #ffd36e 38%, #ff8f3d 70%)", glow: "rgba(255,211,110,0.85)", ring: 0.9 }
  },
  {
    name: "Milky Way Galaxy",
    size: "Diameter: about 100,000 light-years",
    explanation: "The Milky Way is a barred spiral galaxy containing hundreds of billions of stars, gas clouds, dust, planets, and dark matter.",
    comparison: "If the Solar System fit on a coin, the Milky Way would be continental in scale.",
    visual: { size: 240, radius: "50%", bg: "conic-gradient(from 20deg, transparent, #4de8ff, #ffffff, #9b6cff, transparent 78%)", glow: "rgba(155,108,255,0.7)", ring: 0.65 }
  },
  {
    name: "Local Group",
    size: "Diameter: about 10 million light-years",
    explanation: "The Local Group is a neighborhood of galaxies including the Milky Way, Andromeda, Triangulum, and many dwarf galaxies.",
    comparison: "If the Milky Way were a dinner plate, the Local Group would be a room filled with separate plates.",
    visual: { size: 285, radius: "50%", bg: "radial-gradient(circle at 25% 40%, #fff 0 3%, transparent 5%), radial-gradient(circle at 68% 42%, #9b6cff 0 4%, transparent 7%), radial-gradient(circle at 50% 70%, #4de8ff 0 2%, transparent 4%)", glow: "rgba(77,232,255,0.45)", ring: 0.4 }
  },
  {
    name: "Observable Universe",
    size: "Diameter: about 93 billion light-years",
    explanation: "The observable universe is the region whose light has had time to reach us since the Big Bang. It contains galaxies in every direction we can observe.",
    comparison: "If the Milky Way were one pixel, the observable universe would be an enormous digital wall of galaxy pixels.",
    visual: { size: 315, radius: "50%", bg: "radial-gradient(circle, rgba(255,255,255,0.95) 0 1px, transparent 2px), radial-gradient(circle, rgba(77,232,255,0.5), rgba(155,108,255,0.2), transparent 70%)", glow: "rgba(77,232,255,0.7)", ring: 0.25 }
  }
];

const starTypes = [
  {
    label: "Low mass star",
    stages: [
      stage("Nebula", "A cold cloud of gas and dust begins to collapse under gravity.", "10-100 K", "Millions of years", "#79e7ff", "radial-gradient(circle, rgba(121,231,255,0.9), rgba(155,108,255,0.28), transparent 70%)"),
      stage("Protostar", "The collapsing cloud heats up, but nuclear fusion is not yet stable in the core.", "About 2,000-4,000 K", "About 100,000+ years", "#ffd36e", "radial-gradient(circle, #fff5c0, #ffad55, rgba(255,120,70,0.15) 72%)"),
      stage("Red Dwarf", "A small, cool star burns hydrogen slowly and can last far longer than the current age of the universe.", "About 2,500-4,000 K", "Hundreds of billions to trillions of years", "#ff7466", "radial-gradient(circle, #ffd1c7, #ff5f5f, #5d101c 72%)"),
      stage("White Dwarf", "After fuel runs low, the leftover hot core slowly cools in space.", "Initially very hot", "Cooling for billions of years", "#dff8ff", "radial-gradient(circle, #ffffff, #bcefff, rgba(77,232,255,0.08) 70%)")
    ]
  },
  {
    label: "Sun like star",
    stages: [
      stage("Nebula", "Gravity gathers gas and dust into a denser star-forming region.", "10-100 K", "Millions of years", "#79e7ff", "radial-gradient(circle, rgba(121,231,255,0.9), rgba(155,108,255,0.28), transparent 70%)"),
      stage("Protostar", "The young star grows hotter as material falls inward.", "About 2,000-4,000 K", "About 100,000+ years", "#ffd36e", "radial-gradient(circle, #fff5c0, #ffad55, rgba(255,120,70,0.15) 72%)"),
      stage("Main Sequence Star", "Hydrogen fusion in the core balances gravity. Our Sun is in this stage now.", "Surface about 5,800 K", "About 10 billion years", "#ffe27a", "radial-gradient(circle, #ffffff, #ffd36e, #ff9f43 72%)"),
      stage("Red Giant", "The outer layers expand as the core changes fuel sources.", "About 3,000-5,000 K", "Around 1 billion years", "#ff8b5a", "radial-gradient(circle, #ffe1aa, #ff7b42, #3d0611 76%)"),
      stage("Planetary Nebula", "Outer gas layers drift away and glow around the exposed core.", "Ionized gas varies", "Tens of thousands of years", "#9b6cff", "radial-gradient(circle, #ffffff 0 12%, rgba(77,232,255,0.55) 18%, rgba(155,108,255,0.32) 52%, transparent 76%)"),
      stage("White Dwarf", "A dense Earth-sized core remains and slowly fades over time.", "Initially very hot", "Billions of years", "#dff8ff", "radial-gradient(circle, #ffffff, #bcefff, rgba(77,232,255,0.08) 70%)")
    ]
  },
  {
    label: "Massive star",
    stages: [
      stage("Nebula", "A large cloud begins forming a high-mass star.", "10-100 K", "Millions of years", "#79e7ff", "radial-gradient(circle, rgba(121,231,255,0.9), rgba(155,108,255,0.28), transparent 70%)"),
      stage("Protostar", "The forming star pulls in mass quickly and becomes extremely hot.", "Thousands of K", "Short compared with smaller stars", "#ffd36e", "radial-gradient(circle, #fff5c0, #ffad55, rgba(255,120,70,0.15) 72%)"),
      stage("Massive Main Sequence Star", "A very bright blue-white star burns fuel rapidly because of intense core pressure.", "About 10,000-40,000 K", "Millions of years", "#9fefff", "radial-gradient(circle, #ffffff, #9fefff, #2b6dff 72%)"),
      stage("Red Supergiant", "The star expands into a huge cool outer envelope while the core builds heavier elements.", "About 3,500-4,500 K", "Hundreds of thousands to millions of years", "#ff6f4d", "radial-gradient(circle, #ffd0a2, #ff4b3e, #33030a 78%)"),
      stage("Supernova", "The core collapses and the outer layers explode, releasing enormous energy.", "Billions of K in the explosion", "Seconds to months visible", "#ffd36e", "radial-gradient(circle, #fff, #ffd36e 18%, #ff5f8f 42%, rgba(155,108,255,0.2) 76%)"),
      stage("Neutron Star or Black Hole", "The remnant becomes an ultra-dense neutron star or, if massive enough, collapses into a black hole.", "Extreme physics", "Can persist for billions of years", "#4de8ff", "radial-gradient(circle, #000 0 30%, #4de8ff 32%, rgba(155,108,255,0.1) 70%)")
    ]
  }
];

const gravityObjects = [
  { name: "Moon", ratio: 0.166 },
  { name: "Mars", ratio: 0.38 },
  { name: "Jupiter", ratio: 2.53 },
  { name: "Sun", ratio: 27.9 },
  { name: "White Dwarf", ratio: 350000 },
  { name: "Neutron Star", ratio: 100000000000 }
];

const elements = {
  scaleSlider: document.querySelector("#scaleSlider"),
  scaleOutput: document.querySelector("#scaleOutput"),
  scaleButtons: document.querySelector("#scaleButtons"),
  scaleInfo: document.querySelector("#scaleInfo"),
  scaleVisual: document.querySelector("#scaleVisual"),
  scaleMeterFill: document.querySelector("#scaleMeterFill"),
  starMassSlider: document.querySelector("#starMassSlider"),
  starMassOutput: document.querySelector("#starMassOutput"),
  starTypeButtons: document.querySelector("#starTypeButtons"),
  starTimeline: document.querySelector("#starTimeline"),
  starInfo: document.querySelector("#starInfo"),
  starOrb: document.querySelector("#starOrb"),
  earthWeight: document.querySelector("#earthWeight"),
  gravityButton: document.querySelector("#gravityButton"),
  gravityResults: document.querySelector("#gravityResults"),
  blackHoleMass: document.querySelector("#blackHoleMass"),
  blackHoleDistance: document.querySelector("#blackHoleDistance"),
  blackHoleMassOutput: document.querySelector("#blackHoleMassOutput"),
  blackHoleDistanceOutput: document.querySelector("#blackHoleDistanceOutput"),
  blackHoleVisual: document.querySelector("#blackHoleVisual"),
  spacecraft: document.querySelector("#spacecraft"),
  blackHoleInfo: document.querySelector("#blackHoleInfo")
};

let selectedStarType = 1;
let selectedStarStage = 0;

function stage(name, explanation, temperature, lifespan, glow, background) {
  return { name, explanation, temperature, lifespan, glow, background };
}

function formatNumber(value) {
  if (value >= 1_000_000) return value.toExponential(2);
  return Number(value.toFixed(2)).toLocaleString();
}

function createButton(text, isActive, onClick, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.className = `${className} ${isActive ? "active" : ""}`;
  button.addEventListener("click", onClick);
  return button;
}

function updateScaleExplorer() {
  const index = Number(elements.scaleSlider.value);
  const level = scaleLevels[index];
  const progress = (index / (scaleLevels.length - 1)) * 100;

  elements.scaleOutput.textContent = `${index + 1} / ${scaleLevels.length}`;
  elements.scaleMeterFill.style.width = `${progress}%`;
  elements.scaleButtons.innerHTML = "";

  scaleLevels.forEach((item, itemIndex) => {
    elements.scaleButtons.appendChild(createButton(item.name, itemIndex === index, () => {
      elements.scaleSlider.value = itemIndex;
      updateScaleExplorer();
    }, "scale-button"));
  });

  elements.scaleVisual.innerHTML = `<div class="cosmic-object" title="${level.name}"></div>`;
  const object = elements.scaleVisual.querySelector(".cosmic-object");
  object.style.setProperty("--object-size", `${level.visual.size}px`);
  object.style.setProperty("--object-radius", level.visual.radius);
  object.style.setProperty("--object-bg", level.visual.bg);
  object.style.setProperty("--object-color", level.visual.glow);
  object.style.setProperty("--object-glow", `${40 + index * 14}px`);
  object.style.setProperty("--ring-opacity", level.visual.ring);

  elements.scaleInfo.innerHTML = `
    <h3>${level.name}</h3>
    <p>${level.explanation}</p>
    <dl>
      <div><dt>Approximate size</dt><dd>${level.size}</dd></div>
      <div><dt>Comparison</dt><dd>${level.comparison}</dd></div>
    </dl>
  `;
}

function updateStarLifecycle() {
  const starType = starTypes[selectedStarType];
  const stageData = starType.stages[selectedStarStage] || starType.stages[0];
  selectedStarStage = starType.stages.indexOf(stageData);

  elements.starMassSlider.value = selectedStarType;
  elements.starMassOutput.textContent = starType.label;
  elements.starTypeButtons.innerHTML = "";
  elements.starTimeline.innerHTML = "";

  starTypes.forEach((type, index) => {
    elements.starTypeButtons.appendChild(createButton(type.label, index === selectedStarType, () => {
      selectedStarType = index;
      selectedStarStage = 0;
      updateStarLifecycle();
    }, "scale-button"));
  });

  starType.stages.forEach((item, index) => {
    elements.starTimeline.appendChild(createButton(item.name, index === selectedStarStage, () => {
      selectedStarStage = index;
      updateStarLifecycle();
    }, "timeline-button"));
  });

  elements.starOrb.style.setProperty("--star-bg", stageData.background);
  elements.starOrb.style.setProperty("--star-glow", stageData.glow);
  elements.starInfo.innerHTML = `
    <h3>${stageData.name}</h3>
    <p>${stageData.explanation}</p>
    <dl>
      <div><dt>Temperature</dt><dd>${stageData.temperature}</dd></div>
      <div><dt>Lifespan</dt><dd>${stageData.lifespan}</dd></div>
      <div><dt>Star type</dt><dd>${starType.label}</dd></div>
    </dl>
  `;
}

function calculateGravity() {
  const earthWeight = Math.max(0, Number(elements.earthWeight.value) || 0);
  elements.gravityResults.innerHTML = gravityObjects.map(object => {
    const weight = earthWeight * object.ratio;
    return `
      <article class="gravity-card">
        <span>${object.name}</span>
        <strong>${formatNumber(weight)}</strong>
        <small>${object.ratio.toLocaleString()}× Earth gravity</small>
      </article>
    `;
  }).join("");
}

function updateBlackHoleLab() {
  const mass = Number(elements.blackHoleMass.value);
  const distance = Number(elements.blackHoleDistance.value);
  const eventHorizon = mass * 2.95; // Simplified Schwarzschild radius estimate in kilometers per solar mass.
  const dangerScore = mass / distance;
  let status = "Safe orbit";
  let statusClass = "status-safe";
  let message = "The spacecraft is far outside the simplified event horizon zone.";

  if (distance <= mass * 0.55) {
    status = "Crossed event horizon";
    statusClass = "status-danger";
    message = "In this model, the spacecraft is inside the no-return boundary.";
  } else if (dangerScore > 0.65) {
    status = "Extreme gravity";
    statusClass = "status-warning";
    message = "Tidal forces would become dangerous near a real compact black hole.";
  }

  const holeSize = 70 + mass * 1.25;
  const shipPosition = 30 + (distance / 200) * 62;
  elements.blackHoleMassOutput.textContent = `${mass} solar masses`;
  elements.blackHoleDistanceOutput.textContent = `${distance} million km`;
  elements.blackHoleVisual.style.setProperty("--hole-size", `${holeSize}px`);
  elements.spacecraft.style.setProperty("--ship-x", `${shipPosition}%`);
  elements.blackHoleInfo.innerHTML = `
    <h3 class="${statusClass}">${status}</h3>
    <p>${message}</p>
    <dl>
      <div><dt>Estimated event horizon radius</dt><dd>${formatNumber(eventHorizon)} km</dd></div>
      <div><dt>Gravity danger score</dt><dd>${dangerScore.toFixed(2)}</dd></div>
      <div><dt>Model rule</dt><dd>More mass + less distance = more danger</dd></div>
    </dl>
  `;
}

function connectEvents() {
  elements.scaleSlider.addEventListener("input", updateScaleExplorer);
  elements.starMassSlider.addEventListener("input", () => {
    selectedStarType = Number(elements.starMassSlider.value);
    selectedStarStage = 0;
    updateStarLifecycle();
  });
  elements.earthWeight.addEventListener("input", calculateGravity);
  elements.gravityButton.addEventListener("click", calculateGravity);
  elements.blackHoleMass.addEventListener("input", updateBlackHoleLab);
  elements.blackHoleDistance.addEventListener("input", updateBlackHoleLab);
}

connectEvents();
updateScaleExplorer();
updateStarLifecycle();
calculateGravity();
updateBlackHoleLab();
