import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import Stats from 'stats.js';

import { Avatar } from './avatar.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.y += Math.PI;

let controls;
controls = new PointerLockControls(camera, document.body);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const onKeyDown = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      avatar.moveForward = true;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      avatar.moveLeft = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      avatar.moveBackward = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      avatar.moveRight = true;
      break;
    case 'Space':
      if (avatar.canJump === true) avatar.velocity.y += 350;
      avatar.canJump = false;
      break;
  }
};

const onKeyUp = function (event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      avatar.moveForward = false;
      break;
    case 'ArrowLeft':
    case 'KeyA':
      avatar.moveLeft = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      avatar.moveBackward = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      avatar.moveRight = false;
      break;
  }
};

window.addEventListener('click', function () {
  controls.lock();
});

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const avatar = new Avatar(controls, camera);
scene.add(avatar.getObject()); // Add only the avatar's object to the scene

const loader = new GLTFLoader();

// Load the map model
loader.load('/Assets/cs_office_with_real_light/scene.gltf', function (gltf) {
  const mapModel = gltf.scene;
  scene.add(mapModel);

  // Set the initial position of the camera relative to the map model
  const cameraPosition = new THREE.Vector3(-25.15, -12, 2.2); // Adjust the y and z values as needed
  camera.position.copy(cameraPosition);
  mapModel.add(camera);

  // Add lighting to the scene
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(0, 1, 0); // Adjust the position as needed
  scene.add(directionalLight);

  const aimElement = document.getElementById('aim');
  const aimSize = 10; // Adjust the size of the aim circle
  const aimStyle = `width: ${aimSize}px; height: ${aimSize}px; border: 2px solid white; border-radius: 50%; pointer-events: none;`;
  aimElement.style.cssText = aimStyle;

  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.remove();
    aimElement.style.visibility = 'visible';
  }
});

function animate() {
  stats.begin();

  const delta = 0.01;

  avatar.update(delta);

  renderer.render(scene, camera);

  stats.end();

  requestAnimationFrame(animate);
}

animate();
