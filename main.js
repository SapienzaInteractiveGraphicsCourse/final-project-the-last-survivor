
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, CreateScreenshot } from "@babylonjs/core";
import {camera, createScene,engine, GenerateScene} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps } from "./Src/domItems.js";

//render variables
export var scene;

async function main()  {
        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");
        // replace the default loading screen
        //engine.loadingScreen = loadingScreen;
        // show the loading screen
        engine.displayLoadingUI();
        
        scene = await GenerateScene();
        
        // hide the loading screen when you want to
        engine.hideLoadingUI();
       
        // initialize babylon scene and engine

        // hide/show the Inspector
        var p = new Player(scene);
        var e = new Enemy(scene,p);
        // run the main render loopss
        engine.runRenderLoop(() => {
            //console.log(camera.position)
            scene.render();
            p.update();
            e.update();
            divFps.innerHTML = engine.getFps().toFixed() + " fps";
        });

        
        engine.enterPointerlock();
}



main();
