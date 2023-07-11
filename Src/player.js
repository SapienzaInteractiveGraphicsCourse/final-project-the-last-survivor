import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { SceneLoader } from "@babylonjs/core";
import { UnitManager } from "./unitManager";
import { Pistol } from "./pistol";
import { LuckyBox, LuckyBoxInstance } from "./luckyBox";
import { AmmoBox, AmmoBoxInstance } from "./ammo_box";


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
    lockTime;
    money = 500;
    scene;
    
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
        console.log("shot");
        this.weapon.currentAmmo--;
        this.weapon._fire.play( this.weapon._fire.loopAnimation)
        this.weapon._fire.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this.pew();
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

            
    }

    reload() {
        console.log("reload");

        this.weapon._reload.play(this.weapon._reload.loopAnimation)
        this.weapon._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
    }

    endReload() {
        var ammoToLoad = this.weapon.ammoLevel - this.weapon.currentAmmo 
        this.weapon.currentAmmo += (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
        this.weapon.stockedAmmo -= (this.weapon.stockedAmmo>=ammoToLoad? ammoToLoad: this.weapon.stockedAmmo%ammoToLoad)
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

const weaponStats = {
    fireRate : 11, //shoot frequency
    ammo: 30
}

const status = {
    RELOADING : 0,
    SHOOTING: 1,
    IDLE : 2,
}