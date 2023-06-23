import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import Stats from 'stats.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let controls;
controls = new PointerLockControls( camera, document.body );

const direction = new THREE.Vector3();
const velocity =  new THREE.Vector3();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

camera.position.set(-25.647390307638418, -12.330817153248447, 1.7399758698783607);
camera.rotation.y = - Math.PI / 2; // Rotate the camera 90 degrees around the y-axis

const onKeyDown = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;

    }

};

const objects = [];

const onKeyUp = function ( event ) {

    switch ( event.code ) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

let raycaster;
raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

let moveForward = false;
			let moveBackward = false;
			let moveLeft = false;
			let moveRight = false;
			let canJump = false;


window.addEventListener( 'click', function () {

    controls.lock();

} );
document.addEventListener( 'keydown', onKeyDown );
				document.addEventListener( 'keyup', onKeyUp );



// function animate() {
//   stats.begin();
// //   if (ak47Model) {
// //     const ak47MoveSpeed = 0.01;

// //     if (moveState.forward) {
// //       ak47Model.position.z -= ak47MoveSpeed;
// //     }
// //     if (moveState.backward) {
// //       ak47Model.position.z += ak47MoveSpeed;
// //     }
// //     if (moveState.left) {
// //       ak47Model.position.x -= ak47MoveSpeed;
// //     }
// //     if (moveState.right) {
// //       ak47Model.position.x += ak47MoveSpeed;
// //     }
// //   }

//   const moveSpeed = 0.01;

//   if (moveState.forward) {
//     camera.position.x -= camera.position.x * moveSpeed;
//     // camera.position.z -= camera.position.z * moveSpeed;
//     ak47Model.position.x -= ak47Model.position.x * moveSpeed;
//     // ak47Model.position.z -= ak47Model.position.z * moveSpeed

//   }
//   if (moveState.backward) {
//     camera.position.x += camera.position.x * moveSpeed;
//     camera.position.z += camera.position.z * moveSpeed;
//     ak47Model.position.x += ak47Model.position.x * moveSpeed
//     ak47Model.position.z += ak47Model.position.z * moveSpeed

//   }
//   if (moveState.left) {
//     camera.position.x -= camera.position.z * moveSpeed;
//     camera.position.z += camera.position.x * moveSpeed;
//     ak47Model.position.x -= ak47Model.position.z * moveSpeed
//     ak47Model.position.z += ak47Model.position.x * moveSpeed
//   }
//   if (moveState.right) {
//     camera.position.x += camera.position.z * moveSpeed;
//     camera.position.z -= camera.position.x * moveSpeed;
//     ak47Model.position.x += ak47Model.position.z * moveSpeed
//     ak47Model.position.z -= ak47Model.position.x * moveSpeed
//   }

//   renderer.render(scene, camera);
//   stats.end();
//   requestAnimationFrame(animate);
// }

var prevTime;
let initialCameraRotation = controls.getObject().rotation;

function animate() {
    
    stats.begin();
    requestAnimationFrame(animate);

  
    const moveSpeed = 0.1;
    const time = performance.now();


    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
         raycaster.ray.origin.y -= 10;

         const intersections = raycaster.intersectObjects( objects, false );
         const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 2.0 * delta;
        velocity.z -= velocity.z * 2.0 * delta;

        //velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta * 0.05;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta * 0.05;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
//            canJump = true;
        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );
        // Get the camera's position and rotation
    const cameraPosition = controls.getObject().position;
  // Get the camera's current rotation
  const cameraRotation = controls.getObject().rotation;

    



    



        // controls.getObject().position.y += ( velocity.y * delta ); // new behavior
    }
    prevTime = time;

  
    renderer.render(scene, camera);
    stats.end();
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
      objects.push(model);

      // Find the bounding box of the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

    //   // Update the controls target to the center of the model
    //   controls.target.copy(center);
    //   controls.update();

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
      camera.position.set(-25.647390307638418, -12.330817153248447, 1.7399758698783607);

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
