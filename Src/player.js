import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { SceneLoader } from "@babylonjs/core";



//Class that contains all the player info

export class Player {
    //ANIMATIONS, just temporary
    _animGroup = null;
    _idle;
    _draw;
    _reload;
    _fire;
    //

    //PLAYER STATUS
    locked = false;
    status = status.IDLE;
    inputShoot = false;
    //TIME LOCKS
    lockedFor = 0;
    lockTime;

    //
    ammoLevel;
    scene;
    
    constructor(scene) {
        this.scene = scene;
        this.ammoLevel = weaponStats.ammo;

        this.LoadMesh(scene);
        this.addCrosshair(scene);
        this.InputManager(scene);
        
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
                   this.reload();
                case BABYLON.KeyboardEventTypes.KEYDOWN:
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
        this.ammoLevel--;
        this._fire.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this._fire.play(this._fire.loopAnimation);
        this.pew();
    }

    pew() {
        var ray = camera.getForwardRay(999);
        var hit = this.scene.pickWithRay(ray);

        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.scene);

        // if (hit.pickedMesh == target){
        //    health -= 0.1;
	    // } else if (hit.pickedMesh == ground0) {
        //     camera.position = hit.pickedPoint;
        //     camera.position.y += 5;
        // } else {
        //     //camera.position = ray.origin.clone().add(ray.direction.scale(100));
        // }

        if(hit.pickedMesh && hit.pickedMesh.name == "enemy")
            console.log("hit an enemy!!!");
    }

    reload() {
        console.log("reload");
        
        this._reload.play(this._reload.loopAnimation)
        this._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
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
    async LoadMesh(scene) {

        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "./Assets/", "qbz-95_with_hands_and_animations.glb", scene)     

        const weapon = res.meshes[0];
        weapon.scaling = new BABYLON.Vector3(3, 3, 3);
        // Parent the dude to the camera so that he'll go along its position
        weapon.parent = camera;
        weapon.rotation = new BABYLON.Vector3(0,0,0);
        // Position the dude relative to the camera: a little on the front
        // and a little below
        
        weapon.position.z = -0.2;
        weapon.position.x = -0.5;
        
        weapon.computeWorldMatrix();
        
        scene.stopAllAnimations();
        
        weapon.isPickable = false;
        
        weapon.renderingGroupId = 1;

        res.meshes.forEach((m) => m.renderingGroupId = 1);
        
        this._idle = res.animationGroups[1];

        
        this._draw = res.animationGroups[0];    

        this._fire = res.animationGroups[4];
        this._fire.speedRatio = 5;

        this._reload = res.animationGroups[2];
     
        this._draw.play();
        console.log(this._fire);
    }

    getUserposition(){
        var origin = camera.position;

        var _direction = new BABYLON.Vector3(0, -1, 0);
        

        var length = 100;

        var ray = new BABYLON.Ray(origin, _direction, length);
        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.scene);

        var hit = this.scene.pickWithRay(ray);
        hit.fastCheck = true;

        return hit.pickedPoint;
    }

    addCrosshair(scene){
        var crosshairMat = new BABYLON.StandardMaterial("crosshairMat", scene);
        crosshairMat.diffuseColor = new BABYLON.Color3(0,0,0);
        crosshairMat.renderingGroupId = 1;
        this.crosshairTop =
            BABYLON.MeshBuilder.CreateBox("crosshairTop", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairTop.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairTop.position.z += 20;
        this.crosshairTop.position.y += 10.3;
        this.crosshairTop.position.x -= 0;
        this.crosshairTop.isPickable = false;
        this.crosshairTop.parent = camera;
        this.crosshairTop.material = crosshairMat;
        this.crosshairTop.renderingGroupId = 1;

        this.crosshairBottom =
            BABYLON.MeshBuilder.CreateBox("crosshairBottom", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairBottom.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairBottom.position.z += 20;
        this.crosshairBottom.position.y += 9.7;
        this.crosshairBottom.position.x -= 0;
        this.crosshairBottom.isPickable = false;
        this.crosshairBottom.parent = camera;
        this.crosshairBottom.material = crosshairMat;
        this.crosshairBottom.renderingGroupId = 1;

        this.crosshairRight =
            BABYLON.MeshBuilder.CreateBox("crosshairRight", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairRight.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairRight.position.z += 20;
        this.crosshairRight.position.y += 10;
        this.crosshairRight.position.x += .3;
        this.crosshairRight.rotation.z = Math.PI / 2;
        this.crosshairRight.isPickable = false;
        this.crosshairRight.parent = camera;
        this.crosshairRight.material = crosshairMat;
        this.crosshairRight.renderingGroupId = 1;

        this.crosshairLeft =
            BABYLON.MeshBuilder.CreateBox("crosshairLeft", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairLeft.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairLeft.position.z += 20;
        this.crosshairLeft.position.y += 10;
        this.crosshairLeft.position.x -= .3;
        this.crosshairLeft.rotation.z -= Math.PI / 2;
        this.crosshairLeft.isPickable = false;
        this.crosshairLeft.parent = camera;
        this.crosshairLeft.material = crosshairMat;
        this.crosshairLeft.renderingGroupId = 1;
        
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