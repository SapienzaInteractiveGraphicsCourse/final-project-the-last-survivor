
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder } from "@babylonjs/core";
import {createScene,engine} from './Src/scene.js';


async function main()  {
        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");

        var scene = await createScene();
        // initialize babylon scene and engine

        // hide/show the Inspector

        // run the main render loopss
        engine.runRenderLoop(() => {
            scene.render();
        })
}

main();
