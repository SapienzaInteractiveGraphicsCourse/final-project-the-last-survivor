
import * as BABYLON from "@babylonjs/core";
import {canvas} from './domItems';
import { scene } from "../main";

import * as CANNON from "cannon";

export const engine = new BABYLON.Engine(canvas,true);
export var camera;
export var navigation;
import  Navigation from "babylon-navigation-mesh"
import * as YUKA from '../Modules/yuka.module.js'
import { createCellSpaceHelper } from '../Modules/CellSpacePartitioningHelper.js'
import { createConvexRegionHelper } from '../Modules/NavMeshHelper.js'
import { sensitivity,daytime } from '../main'

export var vignette
export var light2;
export async function createScene() {

    var scene = new BABYLON.Scene(engine)
    window.CANNON = CANNON;


    camera = new BABYLON.FreeCamera("FirstViewCamera", new BABYLON.Vector3(-13.615037427611178,  4.03014008407502, 13.469161515024702), scene)
    camera.ellipsoid = new BABYLON.Vector3(0.4, .9, 0.4);
    camera.ellipsoid.isPickable = false;
    // camera.speed =.5;
    scene.gravity.y = -9.8/60;
    scene.collisionsEnabled = true

    camera.checkCollisions = true
    camera.applyGravity = true
    //Controls  WASD

    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysRight.push(68);
    camera.keysLeft.push(65);
    // camera.keysUpward.push(32);
    camera.minZ = 0.1;
    camera.minY = 5;
    camera.inertia = 0.6;
    camera.fov = 1.2;
    camera.speed= 0.8;

    camera.angularSensibility = sensitivity;


    const canvas = scene.getEngine().getRenderingCanvas()

    camera.attachControl(canvas, true)



    vignette = new BABYLON.ImageProcessingPostProcess("processing", 1.0, camera);
    vignette.vignetteWeight = 10;
    vignette.vignetteStretch = 2;
    vignette.vignetteColor = new BABYLON.Color4(1, 0, 0, 1);
    vignette.vignetteEnabled = false;
    

    if (daytime ==="DAY"){
        var light1 = new BABYLON.HemisphericLight("Omni", new BABYLON.Vector3(50, 100, 50), scene);
        light1.intensity =1;
    }
    else {
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogColor = new BABYLON.Color3(0, 0, 0);
        scene.fogDensity = 0.005;
        var light1 = new BABYLON.HemisphericLight("Omni", new BABYLON.Vector3(50, 100, 50), scene);
        light1.intensity =.005;

        // Set the color of the ground light
        light1.groundColor = new BABYLON.Color3(0.396, 0.332, 1);

        // Set the color of the diffuse light
        light1.diffuseColor = new BABYLON.Color3(0.396, 0.332, 1);


        light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0 , -.5, 2), new BABYLON.Vector3(0 , 0, -1), Math.PI /4, 2, scene);

        light2.parent=camera;
    
        light2.diffuse = new BABYLON.Color3(1, 1, 1);
        light2.specular = new BABYLON.Color3(1, 1, 1);
    
        
        light2.exponent=45
        light2.intensity = 300;
        light2.range=50
        light2.angle = Math.PI / 4; // Set the cutoff angle to 45 degrees
    }

    scene.useRightHandedSystem = true

    BABYLON.SceneLoader.ImportMesh("", "Assets/", "de_dust_2_with_real_light.glb",  scene, (meshes) => {


        meshes.forEach((m) => {
            m.checkCollisions = true;
            m.isPickable = true;
        })
        //meshes[0].rotation = new BABYLON.Vector3(0,Math.PI , 0)
    })
    let navmesh = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/", "dustYuka.glb", scene)
    navmesh.meshes.forEach((m) => {
        m.visibility = 0;
        m.checkCollisions = false;
        m.isPickable = true;
    })
    
    //var navmesh = scene.getMeshByName("Navmesh");

    const loader = new YUKA.NavMeshLoader()
    loader.load('Assets/dustYuka.glb', { epsilonCoplanarTest: 0.25 }).then((navMesh) => {
        navigation = navMesh;

        
        const width = 100,
        height = 40,
        depth = 75
        const cellsX = 20,
        cellsY = 5,
        cellsZ = 20

        navigation.spatialIndex = new YUKA.CellSpacePartitioning(width, height, depth, cellsX, cellsY, cellsZ)
        navigation.updateSpatialIndex()
    })

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