import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import Stats from 'stats.js';

import { Avatar } from './avatar.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.y += Math.PI;

var ak47Model;

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
scene.add(avatar);

const loader = new GLTFLoader();

// Load the map model
loader.load('/Assets/cs_office_with_real_light/scene.gltf', function (gltf) {
  const mapModel = gltf.scene;
  scene.add(mapModel);

  // const cameraPosition = new THREE.Vector3(5, 15, -5); // Adjust the y and z values as needed
  //   camera.position.copy(cameraPosition);
  //   mapModel.add(camera);

  // Load the AK47 model
  loader.load('/Assets/ak_47_with_hands_and_animations/scene.gltf', function (gltf) {
    ak47Model = gltf.scene;
    // avatar.object = ak47Model;

    // Set the initial position of the AK47 model relative to the map model
    const ak47ModelPosition = new THREE.Vector3(-25.15, -14, 2.2);
    ak47Model.position.copy(ak47ModelPosition);
    mapModel.add(ak47Model);
    // Add lighting to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 0); // Adjust the position as needed
    scene.add(directionalLight);

    // Adjust the scale and material properties of the AK47 model if needed
    ak47Model.scale.set(0.1, 0.1, 0.1); // Adjust the scale values as needed
    ak47Model.traverse((child) => {
      if (child.isMesh) {
        // Modify material properties
        child.material.color.set(0x000000); // Set the desired color
        child.material.emissive.set(0x000000); // Set the desired emissive color
      }
    });

    // Get the direction vector of the AK47 object
    const ak47Direction = new THREE.Vector3();
    ak47Model.getWorldDirection(ak47Direction);

    // Rotate the AK47 object
    ak47Model.rotation.y = Math.PI / 2; // Rotate 90 degrees around the y-axis

    // Set the initial position of the camera relative to the AK47 model
    const cameraPosition = new THREE.Vector3(5, 15, -5); // Adjust the y and z values as needed
    camera.position.copy(cameraPosition);
    ak47Model.add(camera);

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
});


function animate() {
  stats.begin();
  
  const delta = 0.01;

  if (ak47Model) {
    
    // ak47Model.position.copy(camera.position);
  }

  avatar.update(delta);

  renderer.render(scene, camera);

  stats.end();

  requestAnimationFrame(animate);
}

animate();
