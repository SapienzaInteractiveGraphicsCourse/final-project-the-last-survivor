
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import {camera, createScene,engine} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps } from "./Src/domItems.js";

//render variables
export var scene;

async function main()  {
        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");

        scene = await createScene();
        // initialize babylon scene and engine

        // hide/show the Inspector
        var p = new Player(scene);
        var e = new Enemy(scene);
        // run the main render loopss
        engine.runRenderLoop(() => {
            scene.render();
            p.update();
            divFps.innerHTML = engine.getFps().toFixed() + " fps";
        });

        
        engine.enterPointerlock();
}



main();
