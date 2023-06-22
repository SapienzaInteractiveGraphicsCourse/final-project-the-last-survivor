import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

var isMouseDown = false;
document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 5;

LoadModel();
var controls = new OrbitControls( camera, renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );

    
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
}
animate();

function LoadModel() {
    const loader = new GLTFLoader();

    loader.load( '/Assets/cs_office_with_real_light/scene.gltf', function ( gltf ) {

        scene.add( gltf.scene );

    }, undefined, function ( error ) {

        console.error( error );

} );

}