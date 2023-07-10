
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, CreateScreenshot, RecastJSPlugin, CombineAction } from "@babylonjs/core";
import {camera, createScene,engine, GenerateScene} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps } from "./Src/domItems.js";
import * as YUKA from '/Modules/yuka.module.js'

import { UnitManager } from "./Src/unitManager.js";
import { Pistol } from "./Src/pistol.js";
import { LuckyBox } from "./Src/luckyBox.js";


export var TimeScale;
export var p;
//render variables
export var scene;

let walking = false;
let startTime;

async function main()  {
        await Engine;        
        
        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");

        // Get the size of the window
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;

        // Update the size of the canvas
        canvas.width = windowWidth;
        canvas.height = windowHeight;

        // Update the engine's render width and height
        engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
        engine.setSize(windowWidth, windowHeight);

        
        // Event listener for window resize
        window.addEventListener("resize", function () {
            // Get the new size of the window
            engine.resize()
        });



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

        
        // Event listeners for keydown and keyup events
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("keyup", handleKeyUp);

        // Function to start the game
        async function startGame() {
            // Hide the menu
            var menu = document.getElementById("menu");
            menu.style.display = "none";

            // Show the loading screen
            loadingScreen.style.display = "block";
            
            scene = await createScene();
            
            // hide the loading screen when you want to
            
        
            // initialize babylon scene and engine

            // hide/show the Inspector
            var p = new Player(scene);
            
            var pistol = new Pistol();
            var box = new LuckyBox(p);

            await pistol.init()

            p.LoadWeapon(pistol)
            await box.LoadMesh(p.collider);
            
        // YUKA specific
        
            //run the main render loopss
            var unitManager = null
            
            engine.hideLoadingUI();

            engine.runRenderLoop(() => {
                scene.render();
                p.update();
                var t = Date.now();
                var timeElapsed = startTime - t;
            
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
                if(m.name = "Object_2")
                    m.name = 'enemy.head'
                else
                    m.name = 'enemy'
                console.log(m.name)
                m.checkCollisions = true;
                
                enemy.visibility = 1;
            });
            
            enemy.isPickable = true;
            enemy.name = 'enemy'
            enemy.visibility = 1;
            enemy.computeWorldMatrix();
            //box.computeWorldMatrix();
            scene.stopAllAnimations();

            unitManager = new UnitManager(p, res)
        
            // run the main render loopss

            // Hide the loading screen
            loadingScreen.style.display = "none";
            var elDiv = document.getElementById("el");
            elDiv.style.display = "block";

            engine.enterPointerlock();            
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
                if(camera.keysUp.indexOf(87)===-1){
                    camera.keysUp.push(87);
                    camera.keysDown.push(83);
                    camera.keysRight.push(68);
                    camera.keysLeft.push(65);
                    camera.keysUpward.push(32);
                }
              // Pointer lock is active, hide the pause menu
                menu.style.display = "none";
            } else {
              // Pointer lock is not active, show the pause menu
                removeKeyCodeFromArray(87, camera.keysUp);
                removeKeyCodeFromArray(83, camera.keysDown);
                removeKeyCodeFromArray(68, camera.keysRight);
                removeKeyCodeFromArray(65, camera.keysLeft);
                removeKeyCodeFromArray(32, camera.keysUpward);
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







// Event handler for keydown event
function handleKeyDown(event) {
    if (event.key === "w" || event.key === "s" || event.key === "a" || event.key === "d") {
        // Move camera forward
        walking = true;
        startTime = Date.now();
        //console.log(startTime);
    } 
}

function handleKeyUp(event) {
    
        // Stop vertical movement
        walking = false;
        var elapsedTime = Date.now() - startTime;
        //console.log(elapsedTime);
    
}

function removeKeyCodeFromArray(keyCode, array) {
    const index = array.indexOf(keyCode);
    if (index !== -1) {
        array.splice(index, 1);
    }
}



main();
