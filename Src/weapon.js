import { scene } from "../main";
import { camera } from "./scene";
import * as BABYLON from "@babylonjs/core";


export class Weapon {

    static instance
    _idle;
    _draw;
    _reload;
    _fire;
    fireRate;//numer of round per min
    res;
    damage;
    ammoLevel; //inteso con capienza del caricatore!!!
    stockedAmmo;
    currentAmmo;

    mesh;
    constructor() {
        //this.instance = this;
    }

    reset() {
        this.currentAmmo = this.ammoLevel
        this.stockedAmmo = this.ammoLevel
    }
    
    async loadMesh(name, pos) {
        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "./Assets/", name, scene)     

        const weapon = res.meshes[0];

        weapon.rotation = new BABYLON.Vector3(0,Math.PI,0);
        weapon.position.z = pos.z;
        weapon.position.y = pos.y;
        weapon.position.x = pos.x;
        
        weapon.computeWorldMatrix();
       

        
        scene.stopAllAnimations();
        
        weapon.isPickable = false;
        
        weapon.renderingGroupId = 1;

        res.meshes.forEach((m) => m.renderingGroupId = 1);
              
        //debug per i cheat
        console.log(res.animationGroups); 
        this.mesh = weapon;
        

        this.reloadShootAnimations();
    }

    reloadShootAnimations() {
        var group = new BABYLON.AnimationGroup("fire");
        var _anim = new BABYLON.Animation("Pmag_Pos", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(reloadKeyFrames);
        group.addTargetedAnimation(_anim,this.mesh);
    
        this._reload = group;
    }

    printAnimations(res, group, component) {
        var keys = "";
        var property;
        keys = keys.concat("var " + component + "_frames_position = []\n" + "var " + component +  "_frames_position= []\n");
        res.animationGroups.forEach(gr => {
            
            gr.targetedAnimations.forEach(anim => {       
                if(gr.name == group){
                    if(anim.target.name == component) {
                        if(anim.animation.targetProperty == "position")
                            property = "new BABYLON.Vector3";
                        else
                            property = "new BABYLON.Quaternion";

                        anim.animation.getKeys().forEach(key => {
                            var frame =  Math.round(key.frame.toString())
                            if(frame <= 2) {
                                var string = "\n";
                               
                                var value = "(" + Math.round(key.value.x*1000)/1000 + "," + Math.round(key.value.y*1000)/1000 + "," + Math.round(key.value.z*1000)/1000 ;
                                var functionName = component + "_frames_" + (property == "new BABYLON.Vector3"? "position" : "rotation");
                                string = string.concat( functionName +  ".push(\n" + "{\nframe: " + frame + ",\nvalue:" +  property+ value+ (property == "new BABYLON.Vector3"?"" : ","+Math.round(key.value.w*1000)/1000) + ")\n});")
                                keys = keys.concat( string);
                            }  
                        })
                    }
                }
            })
        })
        console.log(keys);
    }
   
}

var reloadKeyFrames= []

reloadKeyFrames.push(
{
frame: 0,
value:  new BABYLON.Vector3(0,Math.PI,0)
});

reloadKeyFrames.push(
{
frame: 60,
value:  new BABYLON.Vector3(Math.PI/8,Math.PI,)
});

reloadKeyFrames.push(
{
frame: 120,
value:  new BABYLON.Vector3(Math.PI/8,Math.PI,)
});

reloadKeyFrames.push(
{
frame: 180,
value: new BABYLON.Vector3(0,Math.PI,0)
});