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
        var canvas = document.getElementById("renderCanvas");

        var loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.style.display = "none";

        // Get the buttons from the menu
        var startButton = document.getElementById("startBTN");
        var flyButton = document.getElementById("flyBTN");
        var settingsButton = document.getElementById("settingsBTN");

        // Event listeners to the buttons
        startButton.addEventListener("click", startGame);
        flyButton.addEventListener("click", enableFlyMode);
        settingsButton.addEventListener("click", openSettings);

        //Event listener for the pause
        document.addEventListener("pointerlockchange", handlePointerLockChange);
        //Event listener for resume
        document.addEventListener("click", handleClickToResume);

        // Function to start the game
        async function startGame() {
            // Hide the menu
            var menu = document.getElementById("menu");
            menu.style.display = "none";
            
            // Show the loading screen
            loadingScreen.style.display = "block";
        
            // Initialize the Babylon.js engine and scene
            await Engine;
            scene = await createScene();
        
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

            // Hide the loading screen
            loadingScreen.style.display = "none";

            engine.enterPointerlock();

            
            // var e = new Enemy(scene, p);
            // ZombieList.push(e);
        }

        // Function to enable fly mode
        function enableFlyMode() {
            // Add code here to enable fly mode in your game
            console.log("Fly mode enabled");
        }

        // Function to open settings
        function openSettings() {
            // Add code here to open the settings menu
            console.log("Settings menu opened");
        }

        function handlePointerLockChange() {
            var menu = document.getElementById("pauseGame");
            var canvas = document.getElementById("renderCanvas");
        
            // Check if the pointer lock is active
            if (document.pointerLockElement === canvas) {
              // Pointer lock is active, hide the pause menu
              menu.style.display = "none";
            } else {
              // Pointer lock is not active, show the pause menu
              menu.style.display = "flex";
            }
        }
        // Function to handle click to resume game
        function handleClickToResume() {
            var canvas = document.getElementById("renderCanvas");
            var menu = document.getElementById("pauseGame");

            // Check if the pause menu is displayed
            if (menu.style.display === "flex") {
            // Request the pointer lock to resume the game
               engine.enterPointerlock();
            }
        }
}




main();
