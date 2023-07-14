
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
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogColor = new BABYLON.Color3(0, 0, 0);
    scene.fogDensity = 0.05;



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
        var light1 = new BABYLON.HemisphericLight("Omni", new BABYLON.Vector3(50, 100, 50), scene);
        light1.intensity =.01;

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

    // newMeshesmap.meshes.forEach((mesh) => {

    //     // var shadowGenerator3 = new BABYLON.ShadowGenerator(512, light2);
    //     // shadowGenerator3.bias = 0.00005;

    //     // var shadowGenerator2 = new BABYLON.ShadowGenerator(512, light0);
    //     // shadowGenerator2.bias = 0.005;

    //     // var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    //     // shadowGenerator.bias = 0.0000001;

    //     // shadowGenerator.useBlurCloseExponentialShadowMap = true;
    //     // shadowGenerator.depthScale=208
    //     // shadowGenerator.blurScale=0.6

    //     // shadowGenerator.getShadowMap().renderList.push(mesh);
    //     // shadowGenerator2.getShadowMap().renderList.push(mesh);
    //     // shadowGenerator3.getShadowMap().renderList.push(mesh);
    //     mesh.receiveShadows = true;
    //     //  shadowGenerator.frustumEdgeFalloff = 10.0;

    //      if(mesh.name!= "Navmesh"){
    //         mesh.isPickable = true;
    //         mesh.checkCollisions = true;
    //         mesh.isEnabled(true);
            
    //         mesh.visibility = 1;
    //         mesh.receiveShadows = true;
    //      }else{
    //          mesh.visibility=.2;
    //          mesh.checkCollisions = false;
    //          mesh.isPickable = true;
    //      }


    //  })
    

    //Ground(scene)

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


export async function GenerateScene() {
    var scene = new BABYLON.Scene(engine)
    window.CANNON = CANNON;

    window.addEventListener('resize', function(){
        engine.resize();
    });

    scene.enablePhysics();


    camera = new BABYLON.FreeCamera("FirstViewCamera", new BABYLON.Vector3(20, 1, 0), scene)
    camera.ellipsoid = new BABYLON.Vector3(.3,.8, .3)

    camera.speed =.8;
    scene.gravity.y = -9.8/144;
    //dscene.collisionsEnabled = true

    camera.checkCollisions = true
    camera.applyGravity = true
    //Controls  WASD

    // camera.keysUp.push(87);
    // camera.keysDown.push(83);
    // camera.keysRight.push(68);
    // camera.keysLeft.push(65);
    // camera.keysUpward.push(32);
    camera.minZ = 0.1;
    camera.minY = 5;
    camera.inertia = 0.6;
    camera.fov = 1.2;
    camera.speed= 0.8;


    camera.angularSensibility = 2000;

    const canvas = scene.getEngine().getRenderingCanvas()

    camera.attachControl(canvas, true)

    const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 5, 0), scene);
    light.intensity = 1;
    //const spot = new BABYLON.SpotLight("", new BABYLON.Vector3(0, .5, 0), new BABYLON.Vector3(0, 0,1 ),Math.PI/6, 2,scene)
    //spot.intensity = 1
   // spot.falloffType =5;
    //spot.parent = camera;

    //Adding meshes
    await AddMeshes(scene);

    // Skybox
    CreateSkybox(scene);



    return scene;

}

function CreateSkybox(scene) {
        // Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:500.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/MegaSun", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
}


const meshes = ["barrel.glb", "barrels_and_pallet.glb", "concrete_barrier_hq.glb", "dirty_old_tires.glb", "shipping_containers (1).glb", "containers.glb", "real_bush.glb", "long_wall_-_fougeres_-_urbanistes.glb", "forklift_low_poly.glb","b1.glb"];

//GEN ALL THE MESHES AND RETURN THE MERGE OF THEM
async function AddMeshes(scene) {
    //SPAWN CONTAINERS
    var g = Ground(scene);

    var m1 = await Container(new BABYLON.Vector3(4.5,0,5), scene, 0);
    var m2 = await Container(new BABYLON.Vector3(-4.5,0,5), scene, Math.pi);
    var m3 = await Container(new BABYLON.Vector3(4.5,0,-5), scene, 0);
    var m4 = await Container(new BABYLON.Vector3(-4.5,0,-5), scene, Math.pi);
    var m5 = await Barrels(new BABYLON.Vector3(0.7227731050819147, 0.5, -15.000041311163038), scene, Math.pi);
    var m9 = await Barrels(new BABYLON.Vector3(0.7227731050819147, 0.5, 15.000041311163038), scene, Math.pi);
    var m6 = await bushes(scene);
    var m7 = await Tires(scene);
    var m8 = await ForkLift(scene, new BABYLON.Vector3(-16.5,  0, -17))
    var m9 = await Building(scene,new BABYLON.Vector3(30,30,30))
    Walls(new BABYLON.Vector3(0,0,40));


    var x = [m1, m2, m3 , m4, m5, m7 , m8];
    buildNav(m1)
}


// async function buildNav(...args) {

//     // await Recast;
//     // console.log('recast loaded')
//     // const navPlugin = new RecastJSPlugin();
//     // console.log('nav plugin loaded');

//     //navPlugin.createNavMesh(args, parameters);
// }

function buildNav(args) {
    navigation = new Navigation();


    var zoneNodes = navigation.buildNodes(args);
    navigation.setZoneData('scene', zoneNodes);
}

async function ForkLift(scene, position) {
    let mesh = await ImportMeshes(meshes[8]);

    const box = BABYLON.MeshBuilder.CreateBox("box", {width: 1.2, depth: 3.5, height: 3}, scene);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    box.position = position;
    box.visibility = 0;
    box.checkCollisions = true;
    mesh.scaling = new BABYLON.Vector3(0.01, 0.01,0.01)
    mesh.parent = box;

    box.computeWorldMatrix();
    box.freezeWorldMatrix();

    return mesh;
}
function Ground(scene) {
//Ground generation
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 200, height: 200}, scene);
    ground.position = new BABYLON.Vector3(0, 0,  0)
    //ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    ground.checkCollisions = true;

    const mat = new BABYLON.StandardMaterial("", scene);
    var tex = new BABYLON.Texture("Assets/Scene/asphalt.jpg", scene);

    mat.diffuseTexture = tex;
    mat.diffuseTexture.uScale =10;
    mat.diffuseTexture.vScale = 10;
    mat.bumpTexture = new BABYLON.Texture("Assets/Scene/asphalt_bump.png", scene);

    mat.bumpTexture.uScale= 10;
    mat.bumpTexture.vScale = 10;
    ground.material = mat;

    return ground;
}

async function bushes(scene) {
    const positions = [new BABYLON.Vector3(0.7227731050819147, 0.5, -15.000041311163038)]
    for (let index = 0; index < 10; index++) {
        var bush = await ImportMeshes(meshes[6]);
        bush.checkCollisions = false;
        bush.scaling = new BABYLON.Vector3(0.01,0.01,0.01);
        bush.position = new BABYLON.Vector3(Math.random()*20 * Math.pow(-1, index), 0, Math.random()*20 * Math.pow(-1, index));
        for (let mesh of bush.getChildMeshes()) {
            mesh.checkCollisions = false;
            mesh.renderingGroupId = 0;
        }
    }
    for (let index = 0; index < 10; index++) {
        var bush = await ImportMeshes(meshes[6]);
        bush.checkCollisions = false;
        bush.scaling = new BABYLON.Vector3(0.01,0.01,0.01);
        bush.position = new BABYLON.Vector3(Math.random()*20, 0, Math.random()*20 * Math.pow(-1, index));
        for (let mesh of bush.getChildMeshes()) {
            mesh.checkCollisions = false;
            mesh.renderingGroupId = 0;
        }
    }
    for (let index = 0; index < 10; index++) {
        var bush = await ImportMeshes(meshes[6]);
        bush.checkCollisions = false;
        bush.scaling = new BABYLON.Vector3(0.01,0.01,0.01);
        bush.position = new BABYLON.Vector3(Math.random()*20 * Math.pow(-1, index), 0, Math.random()*20);
        for (let mesh of bush.getChildMeshes()) {
            mesh.checkCollisions = false;
            mesh.renderingGroupId = 0;
        }
    }
    for (let index = 0; index < 10; index++) {
        var bush = await ImportMeshes(meshes[6]);
        bush.checkCollisions = false;
        bush.scaling = new BABYLON.Vector3(0.01,0.01,0.01);
        bush.position = new BABYLON.Vector3(Math.random()*20, 0, Math.random()*20);
        for (let mesh of bush.getChildMeshes()) {
            mesh.checkCollisions = false;
            mesh.renderingGroupId = 0;
        }
    }



}

async function Barrels(position,scene, rotation) {
    var b1 = await ImportMeshes(meshes[0]);
    var b2 = await ImportMeshes(meshes[0]);
    var b3 = await ImportMeshes(meshes[0]);

    const box = BABYLON.MeshBuilder.CreateBox("box", {width: 1, depth: 1, height: 1}, scene);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    box.position = position;
    box.visibility = 0;
    box.checkCollisions = true;

    b1.parent = box;
    b2.parent = box;
    b3.parent = box;
    b1. position = new BABYLON.Vector3(0,0,1);
    b2. position = new BABYLON.Vector3(-0.3,0,0.4);
    b3. position = new BABYLON.Vector3(0.3,0,0.4);

    box.position = position;

    return box;
}
async function Container(position, scene, rotation) {
    let mesh = await ImportMeshes(meshes[4]);

    const box = BABYLON.MeshBuilder.CreateBox("box", {width: 7.5, depth: 9, height: 10}, scene);
    box.position = position;
    box.visibility = .1;
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    mesh.parent = box;
    mesh.position.x = 2;
    mesh.position.z = 1.5;
    box.computeWorldMatrix();
    box.freezeWorldMatrix();

    return box;
}


function Walls() {
//     // const wall1 = BABYLON.MeshBuilder.CreateBox("box", {width: 50, depth: 2, height: 10}, scene);
//     // wall1.position = new BABYLON.Vector3(0,0,25);
//     // const wall2 = BABYLON.MeshBuilder.CreateBox("box", {width: 50, depth: 2, height: 10}, scene);
//     // wall2.position = new BABYLON.Vector3(0,0,-25);
//     // const wall3 = BABYLON.MeshBuilder.CreateBox("box", {width: 50, depth: 2, height: 10}, scene);
//     // wall3.position = new BABYLON.Vector3(25,0,0);
//     // wall3.rotation = new BABYLON.Vector3(0,Math.PI/2, 0 );
//     // const wall4 = BABYLON.MeshBuilder.CreateBox("box", {width: 50, depth: 2, height: 10}, scene);
//     // wall4.position = new BABYLON.Vector3(-25,0,0);
//     // wall4.rotation = new BABYLON.Vector3(0,Math.PI/2, 0 );


//     // const mat = new BABYLON.StandardMaterial("", scene);
//     // var tex = new BABYLON.Texture("Assets/Scene/w.jpg", scene);
//     // tex.uScale = 50;
//     // tex.vScale = 10

//     // mat.diffuseTexture = tex;
//     // mat.diffuseTexture.uScale= 5;
//     // mat.diffuseTexture.vScale= 5;
//     // mat.bumpTexture = new BABYLON.Texture("Assets/Scene/w_bump.png", scene);
//     // mat.bumpTexture.uScale = 2;
//     // mat.bumpTexture.vScale = 2;
//     // wall1.material = mat;
//     // wall2.material = mat;


//     //const mat2 = new BABYLON.StandardMaterial("", scene);
//     //var tex2 = new BABYLON.Texture("Assets/Scene/broken_wall_diff_2k.jpg", scene);
//     //tex2.uScale = 10
//     //tex2.vScale = 50

//     //mat2.diffuseTexture = tex2;
//     //mat2.bumpTexture = new BABYLON.Texture("Assets/Scene/broken_wall_rough_2k.jpg", scene);


//     //wall3.material = mat2;
//     //wall4.material = mat2;

//     wall1.checkCollisions = true;
//     wall2.checkCollisions = true;
//     wall3.checkCollisions = true;
//     wall4.checkCollisions = true;


//     return BABYLON.Mesh.MergeMeshes([wall1, wall2, wall3, wall4]);
 }

async function Tires(scene) {
    var t1 = await Tyre(scene, new BABYLON.Vector3(20, 0, 15.000041311163038));
    var t2 = await Tyre(scene, new BABYLON.Vector3(10, 0, -18.000041311163038));
    var t3 = await Tyre(scene, new BABYLON.Vector3(-10, 0, 18.000041311163038));
    var t4 =  await Tyre(scene, new BABYLON.Vector3(-18, 0, 18.000041311163038));


}
async function Tyre(scene, position) {
    let mesh = await ImportMeshes(meshes[3]);

    const box = BABYLON.MeshBuilder.CreateBox("box", {width: 1.2, depth: 1.2, height: 3}, scene);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    box.position = position;
    box.visibility = 0.0;
    box.checkCollisions = true;
    mesh.scaling = new BABYLON.Vector3(0.01, 0.01,0.01)
    mesh.parent = box;
    box.computeWorldMatrix();
    box.freezeWorldMatrix();

    return box;
}

async function ImportMeshes(name) {
    let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/Scene/", name, scene)

    const root = res.meshes[0]

    root.checkCollisions = true;
    const childMeshes = root.getChildMeshes()
    root.renderingGroupId = 0;
    for (let mesh of childMeshes) {
        mesh.checkCollisions = true;
        mesh.renderingGroupId = 0;
    }

    return(root);
}
async function Building(scene1,position) {
    const scene =scene1;
    const model = await ImportMeshes(meshes[9]);
    const box = BABYLON.MeshBuilder.CreateBox("box", {width: 19, depth: 29.5, height: 60}, scene);
    box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.2 }, scene);
    box.position = position;
    box.visibility =0;
    box.checkCollisions = true;
    model.scaling = new BABYLON.Vector3(100, 100, 100)
    //model.position = new BABYLON.Vector3(0, 0, 0)
    model.parent = box;
    model.position = new BABYLON.Vector3(0.3,0,107)
    box.computeWorldMatrix();
    box.freezeWorldMatrix();

    return box;
}

