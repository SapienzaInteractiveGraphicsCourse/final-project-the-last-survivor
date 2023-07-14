
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import * as BABYLON from "@babylonjs/core";
import { MotionBlurPostProcess } from "@babylonjs/core";

import { Enemy } from "./Src/enemy.js";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, CreateScreenshot, RecastJSPlugin, CombineAction } from "@babylonjs/core";
import {camera, createScene,engine, GenerateScene} from './Src/scene.js';
import {Player} from './Src/player.js';
import { ammo, divFps, lifeProgress, lifeBar } from "./Src/domItems.js";
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
export var sensitivity = 2000;
export var daytime;
export var difficulty;
export var ammoBox1, ammoBox2, ammoBox3, ammoBox4, ammoBox5, ammoBox6, ammoBox7;
var finished = false;
var paused = false;
let walking = false;
let startTime;
let isRightMouseButtonDown = false;

var menuBgs
var blurr
var mot

async function main()  {
        await Engine;        
        
        daytime = "DAY"
        difficulty ="NORMAL"
        blurr = true;


        // create the canvas html element and attach it to the webpage
        var canvas = document.getElementById("renderCanvas");

        lifeBar.style.display = "none"

        lifeProgress.style.display = "none";

        BABYLON.Engine.audioEngine.setGlobalVolume(0.5);

        var volume = 0.5;

        var tempScene = new BABYLON.Scene
        menuBgs = new BABYLON.Sound("bgs", "Assets/menu.mp3", tempScene, null, { autoplay: true, loop: true ,  volume: volume});
        
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
        var settingsButton = document.getElementById("settingsBTN");

        // Event listeners to the buttons
        startButton.addEventListener("click", startGame);
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
            engine.enterPointerlock();

            menuBgs.stop()

            scene = await createScene();
            
            if (blurr){
                var motionBlur = new MotionBlurPostProcess(
                                    "motionBlur", 
                                    scene, 
                                    2, // Motion strength 
                                    camera 
                );    
            
                motionBlur.motionBlurSamples = 16; // divide quality by 2
            }
            // hide the loading screen when you want to
            
        
            // initialize babylon scene and engine

            // hide/show the Inspector
            var p = new Player(scene);

            document.addEventListener("mousedown", async (ev) => {
                if (!p.isAiming() && p.status !== 0){
                    if (ev.button===2){
                        if (!isRightMouseButtonDown){
                            isRightMouseButtonDown=true;
                            console.log('right clicked')
                            p.setAim(true);
                        }
                        else{
                            isRightMouseButtonDown=false;
                            console.log('right clicked')
                            p.setAim(false);
                        }
                    }
                }
            });
            

            var pistol = new Pistol();
            await pistol.init()
            var box = new LuckyBox(p);
            ammoBox1 = new AmmoBox(p);
            ammoBox2 = new AmmoBox(p);
            ammoBox3 = new AmmoBox(p);
            ammoBox4 = new AmmoBox(p);
            ammoBox5 = new AmmoBox(p);
            ammoBox6 = new AmmoBox(p);
            ammoBox7 = new AmmoBox(p);

            p.LoadWeapon(pistol)
            await box.LoadMesh(p.collider);
            await ammoBox1.LoadMesh(p.collider, new BABYLON.Vector3(-12.120131858364807, 2.096194466462976, 11.366266535238479), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox2.LoadMesh(p.collider, new BABYLON.Vector3(-32.434365573719354, 1.2420620087993939e-15, -5.600489765047536), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox3.LoadMesh(p.collider, new BABYLON.Vector3(-36.020856010272745, 0.5502144098281907, -20.982882899924686), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox4.LoadMesh(p.collider, new BABYLON.Vector3(-8.48171032805569, -1.9874416330712497, -37.62943200154321), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox5.LoadMesh(p.collider, new BABYLON.Vector3(21.068521746579986, 0.22930107223850799, -15.635727886442485), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox6.LoadMesh(p.collider, new BABYLON.Vector3(14.300432953120715, 1.650643229484568, -44.73937281514947), new BABYLON.Vector3(0, Math.PI, 0));
            await ammoBox7.LoadMesh(p.collider, new BABYLON.Vector3(3.115622796911797, 1.394717674685353e-15, -6.284799825043635), new BABYLON.Vector3(0, Math.PI, 0));

        // YUKA specific

            menuBgs = new BABYLON.Sound("bgs", "Assets/theme.mp3", scene, null, { autoplay: true, loop: true });
        
            //run the main render loopss
            var unitManager = null

            lifeProgress.style.display = "flex";
            lifeBar.style.display = "flex";
            
            engine.hideLoadingUI();

            engine.runRenderLoop(() => {
                // scene.render();
                // p.update();
                // var t = Date.now();
                // var timeElapsed = startTime - t;
                if (finished || paused) return;
                    scene.render();
                    p.update();
                    unitManager?.update()
                    scene.gravity.y = -9.8/engine.getFps().toFixed();
                    divFps.innerHTML = engine.getFps().toFixed() + " fps";
            });

            let res = await BABYLON.SceneLoader.ImportMeshAsync("", "Assets/", "zombie2.glb", scene)    

            
            printEuler();
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
                console.log(m);
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
            var elDiv = document.getElementById("crosshair");
            elDiv.style.display = "flex";
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

            // Get the sensitivity range input element and sensitivity value element
            var sensitivityRange = document.getElementById('sensitivityRange');

            var initialSensitivity = 2000;

            // Add an event listener to the sensitivity range input
            sensitivityRange.addEventListener('input', function(event) {
                // Get the current sensitivity value from the range input
                sensitivity = parseInt(event.target.value);

                // Set the camera's angularSensibility to the current sensitivity value
                sensitivityRange.value = sensitivity;
                
            });

            // Difficulty buttons
            var easyBtn = document.getElementById("easyBtn");
            var normalBtn = document.getElementById("normalBtn");
            var hardBtn = document.getElementById("hardBtn");

            easyBtn.addEventListener("click", function () {
                difficulty = "EASY";
                updateButtonColors();
            });

            normalBtn.addEventListener("click", function () {
                difficulty = "NORMAL";
                updateButtonColors();
            });

            hardBtn.addEventListener("click", function () {
                difficulty = "INSANE";
                updateButtonColors();
            });

           // Time of Day buttons
            var dayBtn = document.getElementById("dayBtn");
            var nightBtn = document.getElementById("nightBtn");

            dayBtn.addEventListener("click", function () {
                daytime = "DAY";
                updateButtonColors();
            });

            nightBtn.addEventListener("click", function () {
                daytime = "NIGHT";
                updateButtonColors();
            });

            mot = document.getElementById("motionblurBtn");

            mot.addEventListener("click", function () {
                blurr = !blurr;
                updateButtonColors();
            });

            updateButtonColors()            

            // Volume range slider
            var volumeRange = document.getElementById("volumeRange");
            var volumeValue = document.getElementById("volumeValue");

            volumeRange.addEventListener("input", function () {
                volume = volumeRange.value / 100;
                volumeRange.value = volume * 100;

                BABYLON.Engine.audioEngine.setGlobalVolume(volumeRange.value/100);
            });

            // Save Changes button
            var saveBtn = document.getElementById("saveBtn");

            saveBtn.addEventListener("click", function () {
                // Hide the settings page
                settings.style.display = "none";

                // Show the menu
                menu.style.display = "flex"; 
            });

            // Reset Changes button
            var resetBtn = document.getElementById("resetBtn");

            resetBtn.addEventListener("click", function () {
                difficulty = "NORMAL";
                daytime = "DAY";
                blurr = true;
                volume = 0.5;
                sensitivity = 2000;
                volume = 0.5;
                sensitivityRange.value = sensitivity;
                volumeRange.value = volume * 100;
                updateButtonColors();
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
                    paused = false;
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
                if (!finished){
                    menu.style.display = "flex";
                    paused = true
                }
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


export function endGame() {
    finished = true
    endMenu.style.display = "flex";
    engine.exitPointerlock()
    rounds.textContent = "You survived for " + UnitManager.instance.roundCounter + " rounds"
    
}

// Event handler for keydown event
function handleKeyDown(event) {
    if (event.key === "w" || event.key === "s" || event.key === "a" || event.key === "d") {
        // Move camera forward
        walking = true;
        startTime = Date.now();
        //console.log(startTime);
    } 
    if (event.shiftKey && event.code === "ShiftLeft") {
        // Increase camera speed
        camera.speed = 1.5;
    }
}

function handleKeyUp(event) {
    if (event.code === "ShiftLeft") {
        // Reset camera speed to default
        camera.speed = 0.8;
    }
    
        // Stop vertical movement
        walking = false;
        var elapsedTime = Date.now() - startTime;
        if (event.shiftKey && event.code === "ShiftLeft") camera.speed = 1;
        //console.log(elapsedTime);
    
}

function removeKeyCodeFromArray(keyCode, array) {
    const index = array.indexOf(keyCode);
    if (index !== -1) {
        array.splice(index, 1);
    }
}


function updateButtonColors() {
    if (daytime === "DAY") {
        dayBtn.style.backgroundColor = "orange";
        nightBtn.style.backgroundColor = "white";
    } else if (daytime === "NIGHT") {
        dayBtn.style.backgroundColor = "white";
        nightBtn.style.backgroundColor = "blue";
    }

    if (difficulty === "EASY") {
        easyBtn.style.backgroundColor = "green";
        normalBtn.style.backgroundColor = "white";
        hardBtn.style.backgroundColor = "white";
    } else if (difficulty === "NORMAL") {
        easyBtn.style.backgroundColor = "white";
        normalBtn.style.backgroundColor = "orange";
        hardBtn.style.backgroundColor = "white";
    } else {
        easyBtn.style.backgroundColor = "white";
        normalBtn.style.backgroundColor = "white";
        hardBtn.style.backgroundColor = "red";
    }

    if (blurr){
        mot.value = "DISABLE MOTION BLUR"
    }
    else{
        mot.value = "ENABLE MOTION BLUR"
    }
}



function printEuler()
{
    var IK_Hand_Cntrl_R_rotation = [{
        frame: 0,
        value: new BABYLON.Quaternion(-0.057135988026857376,  0.01055992767214775,  0.5295121073722839,  0.8463101387023926),
    }]
    IK_Hand_Cntrl_R_rotation .push({
        frame: 3,
        value: new BABYLON.Quaternion(-0.22769106924533844, 0.11611448973417282,  0.5182999968528748,  0.8161123394966125),
    })
    IK_Hand_Cntrl_R_rotation .push({
        frame: 6,
        value: new BABYLON.Quaternion(-0.047852471470832825,  0.011341879144310951,  0.5319801568984985,  0.8453274965286255),
    })
    IK_Hand_Cntrl_R_rotation .push({
        frame: 9,
        value: new BABYLON.Quaternion(-0.07430554181337357,  0.02158804051578045,  0.5318422913551331, 0.8433008790016174),
    })
    IK_Hand_Cntrl_R_rotation .push({
        frame: 12,
        value: new BABYLON.Quaternion(-0.06318460404872894,  0.014429227448999882,  0.530504584312439,0.845200777053833),
    })
    IK_Hand_Cntrl_R_rotation .push({
        frame: 14,
        value: new BABYLON.Quaternion( -0.057135988026857376,  0.01055992767214775,  0.5295121073722839,  0.8463101387023926),
    })
    

for(var i=0; i<=5; i++)
        {
            var stampa= IK_Hand_Cntrl_R_rotation[i].value.toEulerAngles()
            console.log("new BABYLON.Vector3("+stampa.x.toFixed(3)+","+stampa.y.toFixed(3)+","+stampa.z.toFixed(3)+"),\n");
        }
}

main();
