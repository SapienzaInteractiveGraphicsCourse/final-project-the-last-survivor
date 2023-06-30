
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, CreateScreenshot, RecastJSPlugin } from "@babylonjs/core";
import {camera, createScene,engine, GenerateScene} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps } from "./Src/domItems.js";



import {Recast} from "recast-detour/recast.js"


//render variables
export var scene;


var ZombieList = [];
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
        engine.hideLoadingUI();
       
        // initialize babylon scene and engine

        // hide/show the Inspector
        var p = new Player(scene);
        
       
        // run the main render loopss
        engine.runRenderLoop(() => {
            //console.log(camera.position)
            scene.render();
            p.update();
            ZombieList.forEach((e) => e.update())
            divFps.innerHTML = engine.getFps().toFixed() + " fps";
        });

        engine.enterPointerlock();

        
        var e = new Enemy(scene, p);
        ZombieList.push(e);
}




main();
