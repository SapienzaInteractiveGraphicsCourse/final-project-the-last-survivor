
import * as BABYLON from "@babylonjs/core";
import {canvas} from './domItems';


export const engine = new BABYLON.Engine(canvas,true);

export async function createScene() {

    var scene = new BABYLON.Scene(engine)
    scene.gravity.y = -9.8;

    const camera = new BABYLON.UniversalCamera("FirstViewCamera", new BABYLON.Vector3(-40, -50, 0), scene)
    camera.ellipsoid = new BABYLON.Vector3(10, 30, 5)
    camera.speed = 10;

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

    const canvas = scene.getEngine().getRenderingCanvas()
    camera.attachControl(canvas, true)

    let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 10, 0), scene)
    light.intensity = 0.7

    let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/cs_office_csgo_real_light_version.glb");

    const root = res.meshes[0]
    const childMeshes = root.getChildMeshes()

    for (let mesh of childMeshes) {
        mesh.checkCollisions = true
    }

    return scene

}