import * as BABYLON from "@babylonjs/core";
import {camera,engine, vignette, light2} from './scene';
import { Sound } from "@babylonjs/core";
import { SceneLoader } from "@babylonjs/core";
import { UnitManager } from "./unitManager";
import { Sniper } from "./sniper_rifle";
import { Pistol } from "./pistol";
import { LuckyBox, LuckyBoxInstance } from "./luckyBox";
import { AmmoBox, AmmoBoxInstance } from "./ammo_box";
import { AMMO, crosshair, luckyBox, sniperScope, lifeProgress, ammo } from "./domItems";
import { endGame, finished, difficulty, daytime } from "../main";
import { enemy} from "../main"

//Class that contains all the player info

export class Player {
    //ANIMATIONS, just temporary
    _animGroup = null;
    //
    weapon
    collider
    //PLAYER STATUS
    locked = false;
    status = status.IDLE;
    inputShoot = false;
    //TIME LOCKS
    lockedFor = 0;
    hp = 4
    lockTime;
    money = 5000;
    scene;
    aim = false;
    isaiming = false;
    particle = false
    particleSystem
    almostdead = 0;
    spot;
    toggleSound;
    constructor(scene) {
        this.scene = scene;
        this.InputManager(scene); 
        this.collider = BABYLON.MeshBuilder.CreateBox("box", {width:.5, depth: .5, height: 1}, scene); 
        this.collider.parent = camera;
        this.collider.isPickable = false;
        this.collider.checkCollisions = false
        this.collider.visibility = 0
        this.instance = this
        this.particleSystem = new BABYLON.ParticleSystem("particles", 5000);
        if(daytime === "NIGHT"){
            this.spot = true;
        }
        this.toggleSound = new Sound("Music", "Assets/switch_toarch.mp3", scene);
        
    }
    async initWeapon() {
        
    }

    InputManager(scene) {
       
        //manage mouse input
        scene.onPointerDown = (evt) => {
            engine.enterPointerlock();   
            if(evt.button === 0)  {
                if(this.isaiming){
                    return false;
                }
                else{
                    this.inputShoot = true;
                }
                
            }
                
            
        }  

        scene.onPointerUp = (evt) => { 
            if(evt.button === 0)  {
                this.inputShoot = false;
            }
                
            
        }  

        scene.onKeyboardObservable.add((kbInfo) => { 
            if (this.isaiming) {
                return;
              }
    
            if (this.status === status.RELOADING){
                return
            }
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    if(kbInfo.event.key == 'r'){
                        if (this.status !== status.RELOADING){
                            this.ChangeStatus(status.RELOADING);
                        }
                    }
                    if(kbInfo.event.key == 't'){
                        if (daytime === "NIGHT"){
                            if (this.hp>0){
                            this.toggleSound.play()}
                            if (this.spot===true){
                                light2.diffuse = new BABYLON.Color3(0,0,0);                    
                                this.spot = false;
                            }
                            else if (this.spot===false){
                                light2.diffuse = new BABYLON.Color3(1,1,1);                    
                                this.spot = true;
                            }
                        }
                    }
                    if(kbInfo.event.key == 'l')
                        console.log(this.getUserposition());
                    if(kbInfo.event.key == 'f' && LuckyBox.playerInside){
                        this.weapon._aim.speedRatio = 0; // Set speedRatio to 0 to pause the animation
                        if (this.aim){
                            this.aim=false;
                            this.weapon._aim.speedRatio = -5;
                            this.animateAimFOV(1.2); // Smoothly transition to FOV 1.2 (default)
                            this.weapon._aim.play(false);
                            this.weapon._aim.onAnimationEndObservable.addOnce(() => {
                                this.buy();
                            });
                        } else{
                            this.buy();
                        }
                    }
                     
            }

        });

    }

    buy() {
        
        this.weapon._aim.speedRatio = 0; // Set speedRatio to 0 to pause the animation
        if(this.money >= 950 && LuckyBoxInstance.interactable){
            LuckyBoxInstance.open();
            this.money -= 950
        }   
    }
    update() {
        console.log(this.isaiming)
        this.updateLifeBar(this.hp, 4);

        if (this.hp > 2){
            vignette.vignetteEnabled = false
        }
        
        if(this.money >=950 )
        {
            if(!this.particle){
                this.particleSystem = new BABYLON.ParticleSystem("particles", 5000);
                this.particleSystem.particleTexture = new BABYLON.Texture("Assets/flare.png");
                
                this.particleSystem.emitter = LuckyBoxInstance.mesh;
                this.particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, 0.5, -0.2); // Starting all from
                this.particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 2, 0.2); // To...
                this.particleSystem.color1 = new BABYLON.Color4(0.98, 0.94, 0.59);
                this.particleSystem.color2 = new BABYLON.Color4(0.97, 0.91, 0.03);
                this.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

                   // Life time of each particle (random between...
                this.particleSystem.minLifeTime = 2;
                this.particleSystem.maxLifeTime = 3.5;
                this.particleSystem.emitRate = 1500;
                this.particleSystem.minSize = 0.05;
                this.particleSystem.maxSize = 0.1;
                this.particleSystem.updateSpeed = 0.01;
                //this.particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
                this.particleSystem.direction1 = new BABYLON.Vector3(-2, 8, 2);
                this.particleSystem.direction2 = new BABYLON.Vector3(2, 8, -2);
                this.particleSystem.start();
                this.particle =true;
                                }
        }
        else{
                if(this.particle){
                this.particleSystem.targetStopDuration = 0.1;
                this.particle=false
                }
                
            }
        if (this.weapon.ammoLevel===0 || this.weapon.currentAmmo ===10){
            this.status = status.IDLE
        }
        // console.log("THIS.STATUS: " +this.status)
        // console.log("this.inputShoot " + this.inputShoot + " this.locked " + this.locked)
        ///CHECK IF CAN SHOOT
       if(this.inputShoot && !this.locked) {
            this.ChangeStatus(status.SHOOTING);
           
       }
       if (AmmoBox.playerInside) {
            // Update ammo
            this.weapon.stockedAmmo += this.weapon.ammoLevel; // Increase ammo by 10
            // Reset the playerInside flag
            AmmoBox.playerInside = false;
            AMMO.textContent = "Obtained " + this.weapon.ammoLevel + " ammo"
            AMMO.style.display ="block";

            // Wait for 5 seconds and hide the AMMO element
            setTimeout(function() { AMMO.style.display = "none"; }, 3000);
        }
        ammo.innerHTML = "ammo: " + this.weapon.currentAmmo + "/"+ this.weapon.stockedAmmo + "<br>" + "money: " + this.money + "$";
    }
    ///=====================================================================================///
    ///===================================ACTION METHODS====================================///
    ///=====================================================================================///
    ChangeStatus(newState) {
        console.log("INSIDE CHANGE STATUS")
        if(!this.legal(newState)){
           return;
        } 
        if(this.locked) {
           
            return;
        } 
        
        switch (newState) {
            case status.RELOADING:
                if (!this.isaiming){
                    
                
                this.locked = true;
                this.reload()
                }
                break;

            case status.IDLE:
                this.locked = false;
                // this.idle()
                break;

            case status.SHOOTING:
                console.log("INSIDE CHANGE STATUS STATUS.SHOOTING")
                if (this.isaiming) return;
                this.locked = true;
                this.shoot();
                break;
            default:
                
                break;
        }

        this.status = newState;
    }

    legal(newState) {
        switch (newState) {
            case status.RELOADING:
                if (this.isaiming) return;
                if(this.weapon.currentAmmo  == this.weapon.ammoLevel)
                    return false
                if(this.weapon.stockedAmmo == 0)
                    return false
                break;

            case status.SHOOTING:           
                if(this.weapon.currentAmmo <= 0 )  
                    return false;
                else if(this.status === status.RELOADING)
                    return false;
        
                break;
        }
        return true;
    }

    shoot() {
        
        if(this.weapon.currentAmmo <= 0 ) return
        if (this.hp>0){
            this.weapon.shootSound.play()}
        console.log("shot");
        this.weapon.currentAmmo--;
        this.weapon._fire.play( this.weapon._fire.loopAnimation)
        this.weapon._fire.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this.pew();
        this.weapon._aim.speedRatio = 0; // Set speedRatio to 0 to pause the animation
    }

    setAim(boolean) {
        this.aim = boolean;
        if (this.aim && !this.isaiming) {
          crosshair.style.display = "none";
          this.isaiming = true;
          if (this.weapon instanceof Sniper) {
            this.animateAimFOV(0.3); // Smoothly transition to FOV 0.5 (zoomed-in)
        }
          else{
            this.animateAimFOV(0.5); // Smoothly transition to FOV 0.5 (zoomed-in)
          }
          this.weapon._aim.speedRatio = 5;
          this.weapon._aim.play(false);
          this.weapon._aim.onAnimationEndObservable.addOnce(() => {
            this.isaiming = false;
            if (this.weapon instanceof Sniper) {
              sniperScope.style.display = "block";
              this.weapon.mesh.setEnabled(false); // Disable rendering of the weapon mesh for Sniper
            }
          });
        } else if (!this.aim && !this.isaiming) {
          if (this.weapon instanceof Sniper) {
            this.weapon.mesh.setEnabled(true); // Enable rendering of the weapon mesh for Sniper
            sniperScope.style.display = "none";
          }
          crosshair.style.display = "flex";
          this.isaiming = true;
          this.animateAimFOV(1.2); // Smoothly transition to FOV 1.2 (default)
          this.weapon._aim.speedRatio = -5;
          this.weapon._aim.play(false);
          this.weapon._aim.onAnimationEndObservable.addOnce(() => {
            this.isaiming = false;
          });
        }
      }
      
      animateAimFOV(targetFOV) {
        var initialFOV = camera.fov;
        var currentFrame = 0;
        var frameCount = 10; // Adjust this value to control the smoothness of the FOV transition
      
        var animation = new BABYLON.Animation(
          "aimFOVAnimation",
          "fov",
          60,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      
        var keys = [];
        while (currentFrame <= frameCount) {
          var frameRatio = currentFrame / frameCount;
          var fov = BABYLON.Scalar.Lerp(initialFOV, targetFOV, frameRatio);
          keys.push({
            frame: currentFrame,
            value: fov,
          });
          currentFrame++;
        }
      
        animation.setKeys(keys);
        camera.animations = [];
        camera.animations.push(animation);
        this.scene.beginAnimation(camera, 0, frameCount, false);
      }
      

    isAiming(){
        return this.isaiming;
    }
    

    pew() {
        var ray = camera.getForwardRay(999);
        var hit = this.scene.pickWithRay(ray);

        const particleSystem = new BABYLON.ParticleSystem("particles", 2000);
        particleSystem.particleTexture = new BABYLON.Texture("Assets/flare.png");

        if(hit.pickedMesh){
            var name = hit.pickedMesh.id.split(".")
            console.log(hit)
            if(name[0] === "enemy") {
                console.log("hit an enemy");
               console.log(name);
               console.log(hit)

               UnitManager.instance.onEnemyHit(name[name.length - 1]);
               particleSystem.emitter = hit.pickedPoint
               particleSystem.minEmitBox = new BABYLON.Vector3(-0.2, -0.2, -0.2); // Starting all from
               particleSystem.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2); // To...
               particleSystem.color1 = new BABYLON.Color4(0.5, 0, 0);
                particleSystem.color2 = new BABYLON.Color4(0.3, 0, 0);
                particleSystem.colorDead = new BABYLON.Color4(0,0,0);
                particleSystem.emitRate = 500;
               particleSystem.minSize = 0.1;
               particleSystem.maxSize = 0.5;
               particleSystem.updateSpeed = 0.01;
               particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
               particleSystem.start();
               particleSystem.targetStopDuration = 0.3;
            }
        }

        if (this.weapon instanceof Sniper){
            this.rotateCameraSniper(-0.1, 20); // Rotate camera smoothly by -0.05 radians over 10 frames
        }
        else{
            if (difficulty === "EASY"){
                // this.rotateCamera(-0.01, 10); // Rotate camera smoothly by -0.05 radians over 10 frames
            }
            else if(difficulty === "NORMAL"){
                this.rotateCamera(-0.02, 10); // Rotate camera smoothly by -0.05 radians over 10 frames
            }
            else if(difficulty === "INSANE"){
                this.rotateCamera(-0.05, 10); // Rotate camera smoothly by -0.05 radians over 10 frames
            }
        }
    }

    
    rotateCamera(deltaRotation, frameCount) {
        var initialRotationX = camera.rotation.x;
        var targetRotationX = initialRotationX + deltaRotation;
        var currentFrame = 0;
    
        var animation = new BABYLON.Animation(
        "cameraRotationAnimation",
        "rotation.x",
        60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
    
        var keys = [];
    
        while (currentFrame <= frameCount) {
        var frameRatio = currentFrame / frameCount;
        var rotationX = BABYLON.Scalar.Lerp(initialRotationX, targetRotationX, frameRatio);
        keys.push({
            frame: currentFrame,
            value: rotationX,
        });
        currentFrame++;
        }
    
        animation.setKeys(keys);
        camera.animations = [];
        camera.animations.push(animation);
        this.scene.beginAnimation(camera, 0, frameCount, false);
    }

    rotateCameraSniper(deltaRotation, frameCount) {
        var initialRotationX = camera.rotation.x;
        var targetRotationX = initialRotationX + deltaRotation;
        var currentFrame = 0;
      
        var animation = new BABYLON.Animation(
          "cameraRotationAnimation",
          "rotation.x",
          60,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      
        var keys = [];
      
        while (currentFrame <= frameCount) {
          var frameRatio = currentFrame / frameCount;
          var rotationX = BABYLON.Scalar.Lerp(initialRotationX, targetRotationX, frameRatio);
          keys.push({
            frame: currentFrame,
            value: rotationX,
          });
          currentFrame++;
        }
      
        // Add a keyframe at the end to return the rotation to the original position
        keys.push({
          frame: frameCount *2,
          value: initialRotationX,
        });
      
        animation.setKeys(keys);
        camera.animations = [];
        camera.animations.push(animation);
        this.scene.beginAnimation(camera, 0, frameCount *2, false);
      }

    reload() {
        console.log("reload");

        if (this.aim){
            this.weapon._aim.speedRatio = -5;
            this.isaiming=true;
            this.weapon._aim.play( )
            this.weapon._aim.onAnimationEndObservable.addOnce(()  => this.isaiming=false);
            this.animateAimFOV(1.2)        
        }
        if (this.hp>0) this.weapon.reloadSound.play()

        this.weapon._reload.play(this.weapon._reload.loopAnimation)
        this.weapon._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
    }

    endReload() {
        var ammoToLoad = this.weapon.ammoLevel - this.weapon.currentAmmo 
        this.weapon.currentAmmo += (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
        this.weapon.stockedAmmo -= (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
        if (this.aim){
            this.weapon._aim.speedRatio = 5;
            this.isaiming=true;
            this.weapon._aim.play( )
            this.weapon._aim.onAnimationEndObservable.addOnce(()  => this.isaiming=false);

            if (this.weapon instanceof Sniper) {
                this.animateAimFOV(0.3); // Smoothly transition to FOV 0.5 (zoomed-in)
            }
            else{
                this.animateAimFOV(0.5); // Smoothly transition to FOV 0.5 (zoomed-in)
            }
        }

        this.toggleState()
    }

    toggleState()  {
        this.locked = false;    
        this.status = status.IDLE;
    }
    ///=====================================================================================///
    ///===============================INITIALIZE METHODS====================================///
    ///=====================================================================================///
   LoadWeapon(weapon) {
        console.log("Player weapon= " + this.weapon)
        if(this.weapon){
            this.weapon.parent = null;
            this.weapon.position = new BABYLON.Vector3(0,0,0)
            this.weapon.reset();
        }
        console.log("I'm here, weapon = " + weapon)
        this.weapon = weapon
        this.weapon.mesh.parent = camera;
   }

    
    getDamage() {
        return this.weapon.damage;
    }

    getUserposition(){
        var origin = new BABYLON.Vector3(camera.position.x, camera.position.y,camera.position.z);
        origin.y -= 2;
        var _direction = new BABYLON.Vector3(0, 1, 0);
        

        var length = 300;

        var ray = new BABYLON.Ray(origin, _direction, length);
    
        var hit = this.scene.pickWithRay(ray);

        hit.fastCheck = true;
        
        return hit.pickedPoint
    }
    addMoney(money) {
        this.money += money
    }
    takeDamage() {
        this.hp--
        if(this.hp <=3)
            setTimeout(() => {
                this.hp++;
            }, 10000); 
            if (this.hp<=2){
                vignette.vignetteEnabled = true
            }
        
        if(this.hp <= 0)
            endGame()
    }
    changeWeapon(newWeapon) {
        this.weapon.mesh.dispose();
        this.weapon = newWeapon;
        this.weapon.mesh.parent = camera;
        this.weapon.position = new BABYLON.Vector3(0, -10, 0);
        this.weapon.reset();
        this.status = status.IDLE; // Reset the player's status to IDLE after changing the weapon
    
        // Reset the shoot and aim animations
        this.weapon._fire.stop();
        this.weapon._aim.stop();
    }
    // Function to update the life progress
    updateLifeBar(value, maxValue) {
        // Calculate the width of the progress bar based on the value and maxValue
        const progressWidth = (value / maxValue) * 100;
    
        // Set the width of the life progress element
        lifeProgress.style.width = `${progressWidth}%`;

        // Change the color if hp <= 2
        if (value == 3 || value === 2) {
            lifeProgress.style.backgroundColor = 'yellow';
        } else if (value === 1) {
            lifeProgress.style.backgroundColor = 'red';
        } else{
            lifeProgress.style.backgroundColor = 'green';
        }
    }
}
const status = {
    RELOADING : 0,
    SHOOTING: 1,
    IDLE : 2,
}
