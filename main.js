import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

camera.position.z = 5;

var controls = new OrbitControls(camera, renderer.domElement);

LoadModels();

function animate() {
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
    requestAnimationFrame(animate);
    
}
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

            // Set the camera position and target
            const size = box.getSize(new THREE.Vector3()).length();
            camera.position.copy(center);
            camera.position.x -= 30.0;
            camera.position.y += 4.0;
            camera.position.z += 8.0;
            camera.lookAt(center);

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

            // Set the initial position of the second model relative to the camera
            const distance = 10.0;
            const position = camera.position.clone().normalize().multiplyScalar(distance);
            model.position.copy(position);

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
