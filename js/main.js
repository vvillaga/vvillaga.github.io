// /js/main.js

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// ---- DOM container ----
const container = document.getElementById("container3D");
if (!container) {
  throw new Error('Missing <div id="container3D"></div> in your HTML.');
}

// ---- Renderer ----
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Container-based sizing (NOT fullscreen)
function resize() {
  const w = container.clientWidth || 1;
  const h = container.clientHeight || 1;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
  
// ---- Scene / Camera ----
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
camera.position.set(0, 0, 3);

// ---- Lights ----
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 4);
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambLight);

// ---- Controls ----
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// ---- Load GLB ----
const loader = new GLTFLoader();
const MODEL_URL = "./models/scene.glb"; // ✅ matches your screenshot

let object = null;

loader.load(
  MODEL_URL,
  (gltf) => {
    object = gltf.scene;
    scene.add(object);
    frameObject(object);
  },
  (xhr) => {
    if (xhr.total) console.log(`${(xhr.loaded / xhr.total * 100).toFixed(1)}% loaded`);
    else console.log(`${xhr.loaded} bytes loaded`);
  },
  (err) => {
    console.error("GLB load error:", err);
    console.error("Tried:", MODEL_URL);
  }
);

// Auto-center + fit camera
function frameObject(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  box.getSize(size);

  const center = new THREE.Vector3();
  box.getCenter(center);

  // Center model
  obj.position.sub(center);

  // Normalize scale (helps wildly different model sizes)
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const target = 1.5;
  const scale = target / maxDim;
  obj.scale.setScalar(scale);

  // Fit camera distance
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = (target / 2) / Math.tan(fov / 2);

  camera.position.set(0, 0, dist * 2.0);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.update();
}

// ---- Animate ----
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Initial sizing + listeners
resize();
window.addEventListener("resize", resize);

animate();