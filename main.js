import { OrbitControls } from "orbital";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from "three";
import ThreeGlobe from "three-globe";
import { countries } from "./data/globe-data-min.js";
import { airportHistory } from "./data/my-airports.js";
import { travelHistory } from "./data/my-flights.js";

var renderer, camera, scene, controls;
let mouseX = 0;
let mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
var Globe;
const airportIndex = new Map();
airportHistory.airports.forEach((ap, i) => {
  airportIndex.set(ap.text, i + 1);
});
init();
initGlobe();
onWindowResize();
animate();

// SECTION Initializing core ThreeJS elements
function init() {
  console.log(airportIndex);
  // Initialize renderer
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // Initialize scene, light
  scene = new Scene();
  scene.add(new AmbientLight("#fff", 0.6));
  scene.background = new Color("null");

  // Initialize camera, light
  camera = new PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  var dLight = new DirectionalLight("#fff", 0.2);
  dLight.position.set(-800, 2000, 400);
  // camera.add(dLight);

  var dLight1 = new DirectionalLight("#fff", 0.2);
  dLight1.position.set(-200, 500, 200);
  // camera.add(dLight1);

  var dLight2 = new PointLight("#fff", 0.2);
  dLight2.position.set(-200, 100, 100);
  camera.add(dLight2);

  var dLight3 = new DirectionalLight("#fff", 0.2);
  dLight3.position.set(-0, 2000, 0);
  camera.add(dLight3);

  camera.position.z = 400;
  camera.position.x = 0;
  camera.position.y = 0;

  scene.add(camera);

  // Initialize controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dynamicDampingFactor = 0.01;
  controls.enablePan = false;
  controls.enableZoom = false; // Disable zoom functionality
  controls.minDistance = 300;
  controls.maxDistance = 300;
  controls.rotateSpeed = 0.4;
  controls.zoomSpeed = 1;
  controls.autoRotate = true;

  controls.minPolarAngle = Math.PI / 3.5;
  controls.maxPolarAngle = Math.PI - Math.PI / 3;

  //window.addEventListener("resize", onWindowResize, false);
  document.addEventListener("mousemove", onMouseMove);
}
const colorArray = ["green"];
const colorGradients = [
["#008000", "#00FF00"],  // Dark Green to Lime
["#008000", "#00FF00"],  // Dark Green to Lime
["#008000", "#00FF00"],  // Dark Green to Lime

];


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
    .atmosphereColor("#a9a9a9")
    .atmosphereAltitude(0.1)
    .hexPolygonColor((e) => {
      if (e.properties.ISO_A3 === "NGA") {
        return "#00FF00"; // Change color to black for Nigeria
      } else {
        return "#E0E0E0"; // Returns a default color for other countries
      }
    });
  // NOTE Arc animations are followed after the globe enters the scene
  setTimeout(() => {
    Globe.arcsData(travelHistory.flights)
      .arcColor((e) => {
        let index = airportIndex.get(e.from);
        let c = colorGradients[index % colorGradients.length];
        return c;
      })
      .arcAltitude((e) => {
        let arcAlt = getRandomNumber(0.1, 0.4);
        return arcAlt;
      })
      .arcStroke((e) => {
        return 0.5;
      })
      .arcDashLength(1)
      .arcDashGap((e) => e.order + travelHistory.flights.length)
      .arcDashAnimateTime(1200)
      .arcsTransitionDuration(4000)
      .arcDashInitialGap((e) => e.order * 1)
      .pointsData(airportHistory.airports)
      .pointColor((e) => {
        let index = airportIndex.get(e.text);
        if (index > -1) {
          return colorGradients[index % colorGradients.length][1];
        } else {
          return "#E0E0E0";
        }
      })
      .pointsMerge(true)
      .pointAltitude(0.0001)
      .pointRadius(0.3)
      .ringsData(airportHistory.airports)
      .ringMaxRadius(0.65)
      .ringAltitude(0.00011)
      .ringPropagationSpeed(0.8)
      .ringColor((e) => {
        let index = airportIndex.get(e.text);
        if (index > -1) {
          return colorGradients[index % colorGradients.length];
        } else {
          return "#E0E0E0";
        }
      });
  }, 1000);

  // Globe.rotateY(-Math.PI * (5 / 9));
  // Globe.rotateZ(-Math.PI / 6);
  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new Color("#F9FFFB");
  globeMaterial.emissive = new Color("#F9FFFB");
  globeMaterial.emissiveIntensity = 0.8;
  globeMaterial.shininess = 0.8;
  globeMaterial.envMap = null; // Disable the environment map
  globeMaterial.transparent = true;
  globeMaterial.opacity = 0.5; // Adjust the opacity value as needed for a faded look

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
  // camera.position.x +=
  //   Math.abs(mouseX) <= windowHalfX / 2
  //     ? (mouseX / 2 - camera.position.x) * 0.005
  //     : 0;
  camera.position.y += (-mouseY / 2 - camera.position.y) * 0.005;
  camera.lookAt(scene.position);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
