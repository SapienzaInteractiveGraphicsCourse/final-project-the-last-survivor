import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { SceneLoader } from "@babylonjs/core";
import { UnitManager } from "./unitManager";
import { Pistol } from "./pistol";


//Class that contains all the player info

export class Player {
    //ANIMATIONS, just temporary
    _animGroup = null;
    //
    weapon
    //PLAYER STATUS
    locked = false;
    status = status.IDLE;
    inputShoot = false;
    //TIME LOCKS
    lockedFor = 0;
    lockTime;

    scene;
    
    constructor(scene) {
        this.scene = scene;
        this.InputManager(scene); 

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
                    
            }

          });

    }


    update() {
        ///CHECK IF CAN SHOOT
       if(this.inputShoot && !this.locked) {
            this.ChangeStatus(status.SHOOTING);
           
       }
            
        ammo.innerHTML = "ammo: " + this.ammoLevel + "/"+ weaponStats.ammo;
    }
    ///=====================================================================================///
    ///===================================ACTION METHODS====================================///
    ///=====================================================================================///
    ChangeStatus(newState) {
        if(!this.legal(newState)){
           return;
        } 
        if(this.locked) {
           
            return;
        } 
        
        this.locked = true;
        switch (newState) {
            case status.RELOADING:
                
                this.reload()
                break;

            case status.IDLE:
                // this.idle()
                break;

            case status.SHOOTING:
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
                if(this.ammoLevel == 30)
                    return false;
                break;

            case status.SHOOTING:
                if(this.ammoLevel <= 0 )
                    return false;
                if(this.status == status.RELOADING)
                    return false;
                break;
        }
        return true;
    }

    shoot() {
        console.log("shot");
        this.weapon.currentAmmo--;
        this.weapon._fire.play(this._fire.loopAnimation)
        this.weapon.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this.pew();
    }

    

    pew() {
        var ray = camera.getForwardRay(999);
        var hit = this.scene.pickWithRay(ray);

        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.scene);


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
        
        this.weapon._reload.play(this._reload.loopAnimation)
        this.weapon._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
    }

    endReload() {
        this.ammoLevel = 30;
        this.toggleState();
    }

    toggleState()  {
        this.locked = false;    
        this.status = status.IDLE;
    }
    ///=====================================================================================///
    ///===============================INITIALIZE METHODS====================================///
    ///=====================================================================================///
   LoadWeapon(weapon) {
    this.weapon.parent = null;
    this.weapon.position = new BABYLON.Vector3(0,0,0)
    this.weapon.reset();
    
    this.weapon = weapon
    this.mesh.parent = camera;
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