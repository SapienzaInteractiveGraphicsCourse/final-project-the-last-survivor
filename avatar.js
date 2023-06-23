import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Avatar {
  constructor(controls, camera) {
    this.controls = controls;
    this.camera = camera;
    this.model = null;

    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;

    this.init();
  }

  init() {
    const loader = new GLTFLoader();
    loader.load('/Assets/ak_47_with_hands_and_animations/scene.gltf', (gltf) => {
      this.model = gltf.scene;

      // Set the initial position of the AK47 model
      const modelPosition = new THREE.Vector3(0.6, -1.45, -0.6); // Adjust the position as needed
      this.model.position.copy(modelPosition);
      this.controls.getObject().add(this.model);

      this.model.rotation.y = Math.PI;


      // Adjust the scale and material properties of the AK47 model if needed
      this.model.scale.set(0.1, 0.1, 0.1); // Adjust the scale values as needed
      this.model.traverse((child) => {
        if (child.isMesh) {
          // Modify material properties
          child.material.color.set(0xffffff); // Set the desired color
          child.material.emissive.set(0x000000); // Set the desired emissive color
        }
    
      });
    });
  }

  getObject() {
    return this.controls.getObject();
  }

  update(delta) {
    const moveSpeed = 100.0;

    if (this.moveForward) {
      this.velocity.z -= moveSpeed * delta;
    }
    if (this.moveBackward) {
      this.velocity.z += moveSpeed * delta;
    }
    if (this.moveLeft) {
      this.velocity.x -= moveSpeed * delta;
    }
    if (this.moveRight) {
      this.velocity.x += moveSpeed * delta;
    }

    this.controls.getObject().position.y += this.velocity.y * delta;

    this.controls.getObject().translateX(this.velocity.x * delta);
    this.controls.getObject().translateZ(this.velocity.z * delta);

    if (this.controls.getObject().position.y < 10) {
      this.velocity.y = 0;
      this.controls.getObject().position.y = 10;

      this.canJump = true;
    }
  }
}
