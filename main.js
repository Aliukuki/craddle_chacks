import ThreeGlobe from "three-globe";
import { WebGLRenderer, Scene } from "three";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  AxesHelper,
  DirectionalLightHelper,
  CameraHelper,
  PointLight,
  SphereGeometry,
} from "three";
import { OrbitControls } from "orbital";
import { countries } from "./data/globe-data-min.js";
import { travelHistory } from "./data/my-flights.js";
import { airportHistory } from "./data/my-airports.js";

var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var Globe;

init();
initGlobe();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight("#fff", 0.6));
  scene.background = new Color("#fff");

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight("#0xd9d9d9", 0.75);
  dLight.position.set(-800, 2000, 400);
  dLight.castShadow = true; // Enable shadow casting
  scene.add(dLight);

  var dLight1 = new DirectionalLight("#faf3dd", 1);
  dLight1.position.set(-200, 500, 200);
  dLight1.castShadow = true; // Enable shadow casting
  scene.add(dLight1);

  var dLight2 = new PointLight("#faf3dd", 0.75);
  dLight2.position.set(-200, 100, 100);
  dLight2.castShadow = true; // Enable shadow casting
  scene.add(dLight2);

  var dLight3 = new DirectionalLight("#0xd9d9d9", 0.75);
  dLight3.position.set(-0, 2000, 0);
  dLight3.castShadow = true; // Enable shadow casting
  scene.add(dLight3);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Additional effects
  scene.fog = new Fog("#0xd9d9d9", 400, 2000);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.enableZoom = false; // Disable zoom functionality
  controls.minDistance = 500;
  controls.maxDistance = 500;
  controls.rotateSpeed = 0.8;
  controls.zoomSpeed = 1;
  controls.autoRotate = false;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  //window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}

// SECTION Globe
function initGlobe() {
  // Initialize the Globe
  Globe = new ThreeGlobe({
    waitForGlobeReady: true,
    animateIn: true,
  })
    .hexPolygonsData(countries.features)
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.5)
    .showAtmosphere(true)
    .atmosphereColor("#fff")
    .atmosphereAltitude(0.03)
    .hexPolygonColor((e) => {
      if (
        ["LOS", "ABV", "THA", "RUS", "UZB", "IDN", "KAZ", "MYS"].includes(
          e.properties.ISO_A3
        )
      ) {
        return "#46E96A";
      } else return "#46E96A";
    });

  // Initialize arcs and points with random colors
  setTimeout(() => {
    Globe.arcsData(
      travelHistory.flights.map((a) => ({
        ...a,
        color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color for each arc
      }))
    )
      .arcColor(() => '#' + Math.floor(Math.random()*16777215).toString(16)) // Random color for each arc
      .arcAltitude((e) => {
        return e.arcAlt;
      })
      .arcStroke((e) => {
        return e.status ? 0.5 : 0.3;
      })
      .arcDashLength(0.9)
      .arcDashGap(10)
      .arcDashAnimateTime(5400)
      .arcsTransitionDuration(4000)
      .arcDashInitialGap((e) => e.order * 1)
      .pointsData(airportHistory.airports)
      .pointColor(() => '#' + Math.floor(Math.random()*16777215).toString(16)) // Random color for each point
      .pointsMerge(true)
      .pointAltitude(9)
      .pointRadius(0);
  }, 1000);

  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color("#fff");
  globeMaterial.emissive = new Color("#fff");
  globeMaterial.emissiveIntensity = 0.8;
  globeMaterial.shininess = 0.2;
  globeMaterial.envMap = null; // Disable the environment map
  globeMaterial.transparent = true;
  globeMaterial.opacity = 0.1; // Adjust the opacity value as needed for a faded look

  // NOTE Cool stuff
  // globeMaterial.wireframe = true;

  scene.add(Globe);
}

function onMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
  // console.log("x: " + mouseX + " y: " + mouseY);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowHalfX = window.innerWidth / 1;
  windowHalfY = window.innerHeight / 1;
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  camera.position.x +=
    Math.abs(mouseX) <= windowHalfX / 2
      ? (mouseX / 2 - camera.position.x) * 0.005
      : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
