import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import ThreeGlobe from "three-globe";
import { countries } from "./data/globe-data-min.js";
import { airportHistory } from "./data/my-airports.js";
import { travelHistory } from "./data/my-flights.js";

// Core Variables
let renderer, camera, scene, controls, Globe;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// Industrial Color Palette
const COLOR_BG = "#0a0b10"; // Matte black / very dark slate
const COLOR_GLOBE = "#0d1117";
const COLOR_HEX_DEFAULT = "#1a202c";
const COLOR_HEX_HIGHLIGHT = "#2b6cb0"; // Deep Blue
const COLOR_ARC = ["#3182ce", "#63b3ed"]; // Deep blue to light blue gradient
const COLOR_ATMOSPHERE = "#1e3a8a";

// Map Airports
const airportIndex = new Map();
airportHistory.airports.forEach((ap, i) => {
  airportIndex.set(ap.text, i + 1);
});

init();
initGlobe();
animate();

function init() {
  // Initialize renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Initialize scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(COLOR_BG);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  // Initialize camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 0, 400);
  scene.add(camera);

  // Initialize lighting
  const dLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dLight.position.set(-800, 2000, 400);
  camera.add(dLight);

  const dLight2 = new THREE.PointLight(0xffffff, 0.4);
  dLight2.position.set(-200, 100, 100);
  camera.add(dLight2);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.enableZoom = false; 
  controls.minDistance = 300;
  controls.maxDistance = 300;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  // Event Listeners
  window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

function initGlobe() {
  // Initialize the Globe with dark hex polygons
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.6)
    .showAtmosphere(true)
    .atmosphereColor(COLOR_ATMOSPHERE)
    .atmosphereAltitude(0.15)
    .hexPolygonColor((e) => {
      // Highlight Nigeria in deep blue, default others to dark slate
      if (e.properties.ISO_A3 === "NGA") {
        return COLOR_HEX_HIGHLIGHT; 
      }
      return COLOR_HEX_DEFAULT; 
    });

  // Arc and point animations trigger after globe loads
  setTimeout(() => {
    Globe.arcsData(travelHistory.flights)
      .arcColor(() => COLOR_ARC)
      .arcAltitude(() => Math.random() * (0.4 - 0.1) + 0.1)
      .arcStroke(0.6)
      .arcDashLength(1.5)
      .arcDashGap((e) => e.order + travelHistory.flights.length)
      .arcDashAnimateTime(1500)
      .arcsTransitionDuration(4000)
      .arcDashInitialGap((e) => e.order * 1)
      .pointsData(airportHistory.airports)
      .pointColor(() => COLOR_HEX_HIGHLIGHT)
      .pointsMerge(true)
      .pointAltitude(0.01)
      .pointRadius(0.4)
      .ringsData(airportHistory.airports)
      .ringMaxRadius(0.8)
      .ringAltitude(0.011)
      .ringPropagationSpeed(1.2)
      .ringColor(() => COLOR_HEX_HIGHLIGHT);
  }, 1000);

  // Globe Base Material
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new THREE.Color(COLOR_GLOBE);
  globeMaterial.emissive = new THREE.Color(COLOR_GLOBE);
  globeMaterial.emissiveIntensity = 0.5;
  globeMaterial.shininess = 0.4;
  globeMaterial.transparent = true;
  globeMaterial.opacity = 0.9;

  scene.add(Globe);
}

// Utility & Event Functions
function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
