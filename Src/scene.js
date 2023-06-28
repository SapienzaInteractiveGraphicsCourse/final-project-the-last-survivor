
import * as BABYLON from "@babylonjs/core";
import {canvas} from './domItems';


export const engine = new BABYLON.Engine(canvas,true);
export var camera;
export var mapMesh;
export async function createScene() {

    var scene = new BABYLON.Scene(engine)

    
    scene.gravity.y = -9.8/144;
    
    camera = new BABYLON.FreeCamera("FirstViewCamera", new BABYLON.Vector3(10, 4, 15), scene)
    camera.ellipsoid = new BABYLON.Vector3(.15,.8, .15)
    camera.speed =.5;

    scene.collisionsEnabled = true

    camera.checkCollisions = true
    camera.applyGravity = true
    //Controls  WASD

    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysRight.push(68);
    camera.keysLeft.push(65);
    camera.keysUpward.push(32);
    camera.minZ = 0.1;
    camera.minY = 5;
    camera.inertia = 0.6;
    camera.fov = 1.5;

    camera.angularSensibility = 2000;
    
    const canvas = scene.getEngine().getRenderingCanvas()
    
    camera.attachControl(canvas, true)
    const light = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -1, 0), scene);

    let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/", "de_dust_2_with_real_light.glb", scene)

    const root = res.meshes[0]
    mapMesh = root;
    
    root.checkCollisions = true;
    root.freezeWorldMatrix();
    root.isPickable = false;

    const childMeshes = root.getChildMeshes()
    root.renderingGroupId = 0;
    for (let mesh of childMeshes) {
        mesh.checkCollisions = true;
        mesh.freezeWorldMatrix();
        mesh.isPickable = false;
        mesh.renderingGroupId = 0;
    }


    //sky boix

    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:500.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/MegaSun", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;			
        
    return scene

}


