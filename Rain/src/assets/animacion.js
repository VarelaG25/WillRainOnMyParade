import * as THREE from "three"; 
import { OrbitControls } from "jsm/controls/OrbitControls.js";

import getStarfield from "./getStarfield.js";
import { getFresnelMat } from "./getFresnelMat.js";

// === 📏 Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 2.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  precision: "highp",
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// === 🌍 Earth Group ===
const earthGroup = new THREE.Group();
earthGroup.rotation.z = THREE.MathUtils.degToRad(-23.4);
scene.add(earthGroup);

// === 🎮 Controls ===
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === 🧠 Texture Loader ===
const loader = new THREE.TextureLoader();
function loadTexture(path) {
  const tex = loader.load(path);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.minFilter = THREE.LinearMipMapLinearFilter; 
  tex.minFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}


// === 🌍 Earth Material ===
const geometry = new THREE.IcosahedronGeometry(1, 9);
const earthMat = new THREE.MeshPhongMaterial({
  map: loadTexture("./textures/00_earthmap4k.webp"),
  specularMap: loadTexture("./textures/02_earthspec4k.webp"),
  bumpMap: loadTexture("./textures/01_earthbump4k.webp"),
  bumpScale: 0.04,
   metalness: 0,
  roughness: 1,
});
const earthMesh = new THREE.Mesh(geometry, earthMat);
earthGroup.add(earthMesh);

// === 🌃 City Lights ===
const lightsMesh = new THREE.Mesh(
  geometry,
  new THREE.MeshBasicMaterial({
    map: loadTexture("./textures/03_earthlights4k.webp"),
    blending: THREE.AdditiveBlending,
  })
);
earthGroup.add(lightsMesh);

// // === ☁️ Clouds ===
const cloudsMesh = new THREE.Mesh(
  geometry,
  new THREE.MeshStandardMaterial({
    map: loadTexture("./textures/04_earthcloudmap4k.webp"),
    alphaMap: loadTexture("./textures/05_earthcloudmaptrans4k.webp"),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

// === 🌌 Fresnel Glow ===
const fresnelMat = getFresnelMat();
if (fresnelMat.uniforms?.fresnelColor) {
  fresnelMat.uniforms.fresnelColor.value.set(0x00bfff);
} else if (fresnelMat.color) {
  fresnelMat.color.set(0x00bfff);
}
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

// === ☀️ Lights ===
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x404040, 0.8));

// const ambient = new THREE.AmbientLight(0xffffff, 0.2);
// const dirLight = new THREE.DirectionalLight(0xffffff, 1);
// dirLight.position.set(5, 2, 5);
// scene.add(ambient, dirLight);


// === ✨ Stars ===
const starfield = getStarfield({ numStars: 2000 });
scene.add(starfield);
starfield.material.transparent = true;
starfield.material.opacity = 1;
starfield.material.blending = THREE.AdditiveBlending;

// Store initial positions
const initialPositions = starfield.geometry.attributes.position.array.slice();
const initialEarthPos = earthGroup.position.clone();

// === 📱 Resize ===
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// === 🖱️ Animation States ===
let isAnimating = false;
let direction = 1;
const animationDuration = 1;
let animationTime = 0;

// 🌍 Rotation phase variables
let isRotating = false;
let rotationTime = 0;
const rotationDuration = 2; // seconds for Earth rotation
let initialRotationY = earthGroup.rotation.y;

// Easing function (ease-in-out cubic)
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// === 🖱️ Click event ===
window.addEventListener("click", () => {
  if (!isAnimating && !isRotating) {
    isRotating = true;
    rotationTime = 0;
    initialRotationY = earthGroup.rotation.y;
  }
});

// === 🎞️ Animate ===
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // 🌍 Rotation phase
  if (isRotating) {
    rotationTime += delta;
    const t = Math.min(rotationTime / rotationDuration, 1);
    const eased = easeInOutCubic(t);

    // Rotate Earth smoothly
    const rotationAmount = Math.PI * 2; // one full spin
    earthGroup.rotation.y = initialRotationY + eased * rotationAmount;
    cloudsMesh.rotation.y = initialRotationY + eased * rotationAmount * 1.05; // slightly faster
    glowMesh.rotation.y = initialRotationY + eased * rotationAmount * 0.95;  // slightly slower

    if (t >= 1) {
      isRotating = false;
      rotationTime = 0;

      // Start movement animation after rotation
      isAnimating = true;
      animationTime = 0;
      direction *= -1;
    }
  }

  // 🚀 Movement animation (original)
  if (isAnimating) {
    animationTime += delta;
    const t = Math.min(animationTime / animationDuration, 1);
    const momentum = Math.sin(t * Math.PI * 0.5); // ease-out
    const distance = 12 * momentum * direction;

    const positions = starfield.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] = initialPositions[i] + distance;
    }
    starfield.geometry.attributes.position.needsUpdate = true;

    earthGroup.position.x = initialEarthPos.x + distance;

    if (t >= 1) {
      isAnimating = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

//TEXT
const overlay = document.getElementById("overlay");

window.addEventListener("click", () => {
  // Fade out overlay on first click
  if (overlay && !overlay.classList.contains("hidden")) {
    overlay.classList.add("hidden");
  }

  // Trigger the rotation + animation sequence
  if (!isAnimating && !isRotating) {
    isRotating = true;
    rotationTime = 0;
    initialRotationY = earthGroup.rotation.y;
  }
});

