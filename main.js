
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
import { Assault } from "./Src/assault_rifle.js";
import { LuckyBox } from "./Src/luckyBox.js";
import { AmmoBox } from "./Src/ammo_box.js"
import { Sniper } from "./Src/sniper_rifle.js";


export var TimeScale;
export var p;
//render variables
export var scene;
export var enemy;
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

            document.getElementById("fps").style.display = "block";
            document.getElementById("ammo").style.display = "block";
            document.getElementById("runData").style.display = "block";

            // Show the loading screen
            loadingScreen.style.display = "flex";
            
            scene = await createScene();
            
            // hide the loading screen when you want to
            
        
            // initialize babylon scene and engine

            // hide/show the Inspector
            var p = new Player(scene);
            

            var pistol = new Pistol();
            await pistol.init()
            var box = new LuckyBox(p);
            var ammoBox = new AmmoBox(p);

            p.LoadWeapon(pistol)
            await box.LoadMesh(p.collider);
            await ammoBox.LoadMesh(p.collider, new BABYLON.Vector3(-12.120131858364807, 2.096194466462976, 11.366266535238479), new BABYLON.Vector3(0, Math.PI, 0));

            
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

            let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/", "zombie1.gltf", scene)    

            enemy = res.meshes[0];
            enemy.scaling = new BABYLON.Vector3(1, 1, 1);
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
            console.log("Settings menu opened");
            // Show the settings page
            var settings = document.getElementById("settings");
            settings.style.display = "flex";

            // Hide the menu
            var menu = document.getElementById("menu");
            menu.style.display = "none";

            // Set up event listeners for the settings elements

            // Difficulty buttons
            var easyBtn = document.getElementById("easyBtn");
            var normalBtn = document.getElementById("normalBtn");
            var hardBtn = document.getElementById("hardBtn");

            easyBtn.addEventListener("mouseover", function() {
                showDescription("Easy difficulty description");
            });            
            easyBtn.addEventListener("mouseout", function() {
                hideDescription();
            });            
            normalBtn.addEventListener("mouseover", function() {
                showDescription("Normal difficulty description");
            });            
            normalBtn.addEventListener("mouseout", function() {
                hideDescription();
            });            
            hardBtn.addEventListener("mouseover", function() {
                showDescription("Hard difficulty description");
            });            
            hardBtn.addEventListener("mouseover", function() {
                hideDescription();
            });            
            

            // Time of Day buttons
            var dayBtn = document.getElementById("dayBtn");
            var nightBtn = document.getElementById("nightBtn");

            dayBtn.addEventListener("mouseover", function () {
                showDescription("Day time description");
            });
            nightBtn.addEventListener("mouseover", function () {
                showDescription("Night time description");
            });

            // Field of View (FOV) range slider
            var fovRange = document.getElementById("fovRange");
            var fovValue = document.getElementById("fovValue");

            fovRange.addEventListener("input", function () {
                fovValue.textContent = fovRange.value;
            });

            // Volume range slider
            var volumeRange = document.getElementById("volumeRange");
            var volumeValue = document.getElementById("volumeValue");

            volumeRange.addEventListener("input", function () {
                volumeValue.textContent = volumeRange.value;
            });

            // Save Changes button
            var saveBtn = document.getElementById("saveBtn");

            saveBtn.addEventListener("click", function () {
                // Code to save the settings changes
            });

            // Reset Changes button
            var resetBtn = document.getElementById("resetBtn");

            resetBtn.addEventListener("click", function () {
                // Code to reset the settings changes
            });

            // Exit button
            var exitBtn = document.getElementById("exitBtn");

            exitBtn.addEventListener("click", function () {
                // Hide the settings page
                settings.style.display = "none";

                // Show the menu
                menu.style.display = "flex";
            });
        }

        // Function to show description for settings elements
        function showDescription(description) {
            var descriptionElement = document.getElementById("difficultyDescription");
            descriptionElement.textContent = description;
        }

        function hideDescription() {
            var descriptionElement = document.getElementById("difficultyDescription");
            descriptionElement.style.display = "none";
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
