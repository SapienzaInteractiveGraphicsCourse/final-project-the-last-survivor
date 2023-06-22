import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

camera.position.set(-25.647390307638418, -12.330817153248447, 1.7399758698783607);

const controls = new OrbitControls(camera, renderer.domElement);

const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

document.addEventListener('keydown', (event) => {
  handleMoveState(event.code, true);
});

document.addEventListener('keyup', (event) => {
  handleMoveState(event.code, false);
});

function handleMoveState(keyCode, value) {
  switch (keyCode) {
    case 'KeyW':
      moveState.forward = value;
      break;
    case 'KeyS':
      moveState.backward = value;
      break;
    case 'KeyA':
      moveState.left = value;
      break;
    case 'KeyD':
      moveState.right = value;
      break;
  }
}

function animate() {
  stats.begin();

  const moveSpeed = 0.01;

  if (moveState.forward) {
    camera.position.x -= camera.position.x * moveSpeed;
    camera.position.z -= camera.position.z * moveSpeed;
  }
  if (moveState.backward) {
    camera.position.x += camera.position.x * moveSpeed;
    camera.position.z += camera.position.z * moveSpeed;
  }
  if (moveState.left) {
    camera.position.x -= camera.position.z * moveSpeed;
    camera.position.z += camera.position.x * moveSpeed;
  }
  if (moveState.right) {
    camera.position.x += camera.position.z * moveSpeed;
    camera.position.z -= camera.position.x * moveSpeed;
  }

  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(animate);
}

let ak47Model; // Variable to store the AK47 model

LoadModels();
animate();

function LoadModels() {
  const loader = new GLTFLoader();

  const gltf1Promise = new Promise((resolve, reject) => {
    loader.load('/Assets/cs_office_with_real_light/scene.gltf', function (gltf) {
      const model = gltf.scene;
      scene.add(model);

      // Find the bounding box of the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      // Update the controls target to the center of the model
      controls.target.copy(center);
      controls.update();

      resolve();
    }, undefined, function (error) {
      console.error(error);
      reject();
    });
  });

  const gltf2Promise = new Promise((resolve, reject) => {
    loader.load('/Assets/ak_47_with_hands_and_animations/scene.gltf', function (gltf) {
      const model = gltf.scene;
      scene.add(model);

      // Set the initial position of the second model in world coordinates
      const ak47ModelPosition = new THREE.Vector3(-25.15, -14, 2.2);
      model.position.copy(ak47ModelPosition);

      // Add lighting to the scene
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(0, 1, 0); // Adjust the position as needed
      scene.add(directionalLight);

      // Adjust the scale and material properties of the model if needed
      model.scale.set(0.1, 0.1, 0.1); // Adjust the scale values as needed
      model.traverse((child) => {
        if (child.isMesh) {
          // Modify material properties
          child.material.color.set(0xffffff); // Set the desired color
          child.material.emissive.set(0x000000); // Set the desired emissive color
        }
      });

      // Get the direction vector of the AK47 object
      const ak47Direction = new THREE.Vector3();
      model.getWorldDirection(ak47Direction);

      // Rotate the AK47 object
      model.rotation.y = Math.PI / 2; // Rotate 90 degrees around the y-axis

      ak47Model = model;
      console.log('AK47 Direction:', ak47Model.rotation.x);

      resolve();
    }, undefined, function (error) {
      console.error(error);
      reject();
    });
  });

  // Wait for both models to load before removing the loading overlay
  Promise.all([gltf1Promise, gltf2Promise]).then(() => {
    // Remove the loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  });
}
