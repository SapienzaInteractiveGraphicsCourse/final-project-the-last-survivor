import * as BABYLON from "@babylonjs/core";
import {camera,engine, vignette} from './scene';
import { SceneLoader } from "@babylonjs/core";
import { UnitManager } from "./unitManager";
import { Sniper } from "./sniper_rifle";
import { Pistol } from "./pistol";
import { LuckyBox, LuckyBoxInstance } from "./luckyBox";
import { AmmoBox, AmmoBoxInstance } from "./ammo_box";
import { AMMO, crosshair, sniperScope } from "./domItems";
import { endGame, finished } from "../main";


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
    
    constructor(scene) {
        this.scene = scene;
        this.InputManager(scene); 
        this.collider = BABYLON.MeshBuilder.CreateBox("box", {width:.5, depth: .5, height: 1}, scene); 
        this.collider.parent = camera;
        this.collider.isPickable = false;
        this.collider.checkCollisions = false
        this.collider.visibility = 0.2
        this.instance = this
    }
    async initWeapon() {
        
    }

    InputManager(scene) {
       
        //manage mouse input
        scene.onPointerDown = (evt) => {
            engine.enterPointerlock();   
            if(evt.button === 0)  {
                this.inputShoot = true;
                
            }
                
            
        }  

        scene.onPointerUp = (evt) => { 
            if(evt.button === 0)  {
                this.inputShoot = false;
            }
                
            
        }  

        scene.onKeyboardObservable.add((kbInfo) => { 
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    if(kbInfo.event.key == 'r')
                        this.ChangeStatus(status.RELOADING);
                    if(kbInfo.event.key == 'l')
                        console.log(this.getUserposition());
                    if(kbInfo.event.key == 'f' && LuckyBox.playerInside)
                        this.buy();
                        
            }

          });

    }

    buy() {
        if(this.money >= 950 && LuckyBoxInstance.interactable){
            LuckyBoxInstance.open();
            this.money -= 950
        }   
    }
    update() {
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
                this.locked = true;
                this.reload()
                break;

            case status.IDLE:
                this.locked = false;
                // this.idle()
                break;

            case status.SHOOTING:
                console.log("INSIDE CHANGE STATUS STATUS.SHOOTING")
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
        this.weapon.shootSound.play()
        console.log("shot");
        this.weapon.currentAmmo--;
        this.weapon._fire.play( this.weapon._fire.loopAnimation)
        this.weapon._fire.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this.pew();
    }

    setAim(boolean) {
        this.aim = boolean;
        if (this.aim && !this.isaiming) {
          crosshair.style.display = "none";
          this.isaiming = true;
          this.animateAimFOV(0.5); // Smoothly transition to FOV 0.5 (zoomed-in)
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


        if(hit.pickedMesh){
            var name = hit.pickedMesh.id.split(".")
            console.log(name)
            if(name[0] === "enemy") {
                console.log("hit an enemy");
               console.log(name[name.length - 1]);
               UnitManager.instance.onEnemyHit(name[name.length - 1]);
            }
               
        }

        if (this.weapon instanceof Sniper){
            this.rotateCameraSniper(-0.1, 20); // Rotate camera smoothly by -0.05 radians over 10 frames
        }
        else{
            this.rotateCamera(-0.05, 10); // Rotate camera smoothly by -0.05 radians over 10 frames
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
            this.weapon._aim.speedRatio = -1;
            this.weapon._aim.play( )
            camera.fov = 1.2;
        }
        this.weapon.reloadSound.play()

        this.weapon._reload.play(this.weapon._reload.loopAnimation)
        this.weapon._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
    }

    endReload() {
        var ammoToLoad = this.weapon.ammoLevel - this.weapon.currentAmmo 
        this.weapon.currentAmmo += (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
        this.weapon.stockedAmmo -= (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
        if (this.aim){
            this.weapon._aim.speedRatio = 1;
            this.weapon._aim.play( )
            camera.fov = 0.5;
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
        if(this.hp <=2)
            vignette.vignetteEnabled = true
        
        if(this.hp <= 0)
            endGame()
    }
    changeWeapon(newWeapon) {
        this.weapon.mesh.dispose();
        this.weapon = undefined
        this.weapon = newWeapon
        this.weapon.parent = null;
        this.weapon.mesh.parent = camera;
        this.weapon.position = new BABYLON.Vector3(0,-10,0)
        this.weapon.reset();
        this.status = status.IDLE; // Reset the player's status to IDLE after changing the weapon
    }
}
const status = {
    RELOADING : 0,
    SHOOTING: 1,
    IDLE : 2,
}
