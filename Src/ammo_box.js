import * as BABYLON from "@babylonjs/core";
import { camera } from "./scene";
import { Weapon } from "./weapon";
import { p, scene } from "../main";
import { AMMO } from "./domItems";

export let AmmoBoxInstance

export class AmmoBox {
    static playerInside = false;
    constructor(player) {
        this.player = player
        AmmoBoxInstance = this;
    }
    
    async LoadMesh(playerCollider, position) {
        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "Assets/", "ammo_box.glb", scene)     

        const box = res.meshes[0];
        
        box.computeWorldMatrix();

        var collider = await BABYLON.MeshBuilder.CreateBox("box", {width:50, depth: 20, height: 300}, scene); 
        collider.visibility = 0
        collider.isPickable = false
        
        collider.actionManager = new BABYLON.ActionManager(scene)

        console.log(this.player)
        collider.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({ 
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                    parameter:playerCollider
                },function(player){
                    console.log(player.source)
                    AmmoBox.playerInside = true;
                    box.dispose();
                }));

        collider.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({ 
                    trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
                    parameter:playerCollider 
                },function(){

                    AMMO.style.display ="none";
                    AmmoBox.playerInside = false;
            }));
        


        collider.parent = box;  

        box.position = position;
        box.rotation = new BABYLON.Vector3(0, Math.PI, 0)
        box.scaling = new BABYLON.Vector3(.02, .02, .02); // Set the scale to (5, 5, 5)

        box.checkCollisions = false;
        
        box.renderingGroupId = 1;
        box.freezeWorldMatrix()

        res.meshes.forEach((m) => {
            m.checkCollisions = false; 
            m.freezeWorldMatrix()
        });
              
    }
}