
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, CreateScreenshot, RecastJSPlugin } from "@babylonjs/core";
import {camera, createScene,engine, GenerateScene} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps } from "./Src/domItems.js";
import * as YUKA from '/Modules/yuka.module.js'
import { UnitManager } from "./Src/unitManager.js";


export var TimeScale;

//render variables
export var scene;



async function main()  {
        await Engine;        
        
        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");
        // replace the default loading screen
        //engine.loadingScreen = loadingScreen;
        // show the loading screen
        engine.displayLoadingUI();
        
        scene = await createScene();
        
        // hide the loading screen when you want to
        
       
        // initialize babylon scene and engine

        // hide/show the Inspector
        var p = new Player(scene);
          // YUKA specific
       
        //run the main render loopss
        var unitManager = null
        
        engine.hideLoadingUI();

        engine.runRenderLoop(() => {
           
            scene.render();
            p.update();
            unitManager?.update()
            divFps.innerHTML = engine.getFps().toFixed() + " fps";
        });

        let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/", "ct_gign.glb", scene)     
        
        const enemy = res.meshes[0];
        enemy.scaling = new BABYLON.Vector3(.02, .02, .02);
        enemy.rotation = new BABYLON.Vector3(0,0,0);
        enemy.checkCollisions = true;

        

        res.meshes.forEach((m) => {
            m.checkCollisions = true;
            m.name = 'enemy'
            enemy.visibility = 1;
        });
        
        enemy.isPickable = true;
        enemy.name = 'enemy'
        enemy.visibility = 1;
        enemy.computeWorldMatrix();
        //box.computeWorldMatrix();
        scene.stopAllAnimations();

        unitManager = new UnitManager(p, res)
        engine.enterPointerlock()    
       
}




main();
