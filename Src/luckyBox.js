import * as BABYLON from "@babylonjs/core";
import { camera } from "./scene";
import { Weapon } from "./weapon";
import { Pistol } from "./pistol";
import { Assault } from "./assault_rifle";
import { p, scene } from "../main";
import { luckyBox } from "./domItems";

export let LuckyBoxInstance

export class LuckyBox {
    opened = false;
    static playerInside = false;
    openAnim;
    closeAnim
    constructor(player) {
        this.player = player
        LuckyBoxInstance = this;
    }
    
    async LoadMesh(playerCollider) {
        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "Assets/", "11_mystery_box_-_3december2019.glb", scene)     

        const box = res.meshes[0];
        
        box.computeWorldMatrix();

        var collider = BABYLON.MeshBuilder.CreateBox("box", {width:3, depth: 3, height: 5}, scene); 
        collider.visibility = 0.2
        
        collider.actionManager = new BABYLON.ActionManager(scene)

        console.log(this.player)
        collider.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({ 
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                    parameter:playerCollider
                },function(player){
                    console.log(player.source)
                    luckyBox.textContent = "Press F to open the crate (950$ are required)"
                    luckyBox.style.display ="block";
                    LuckyBox.playerInside = true;
                    
                }));

        collider.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({ 
                    trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, 
                    parameter:playerCollider 
                },function(){

                    luckyBox.style.display ="none";
                    LuckyBox.playerInside = false;
            }));
        


        collider.parent = box;  

        box.position = new BABYLON.Vector3(-12.018705687027015, 2.623011973051353,  16.80750695287436)
        box.rotation = new BABYLON.Vector3(0, Math.PI, 0)
        
        box.checkCollisions = false;
        
        box.renderingGroupId = 1;
        box.freezeWorldMatrix()

        res.meshes.forEach((m) => {
            m.checkCollisions = true; 
            m.freezeWorldMatrix()
        });
              
        
        //debug per i cheat
        console.log(res.animationGroups); 

        var crate = box.getChildren(((m) => m.name == "Object_9"), false)
        console.log(crate)
        var group = new BABYLON.AnimationGroup("open");

        var _anim = new BABYLON.Animation("create_rotation", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(openRot);
        group.addTargetedAnimation(_anim,crate);
        this.openAnim = group

        var group = new BABYLON.AnimationGroup("close");

        var _anim = new BABYLON.Animation("create_rotation", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(closeRot);
        group.addTargetedAnimation(_anim,crate);
        this.closeAnim = group
        //usare qui i cheat
        //printAnimations(res, group, component)
    }


    open() {
        if(this.opened) return
        this.opened = true
        this.openAnim.play(  this.openAnim.loopAnimation)
        this.openAnim.onAnimationEndObservable.addOnce(()  => this.onOpen());
    }

    close() {
        if(!this.opened) return
        this.closeAnim.play(  this.openAnim.loopAnimation)
        this.openAnim.onAnimationEndObservable.addOnce(()  => this.onClose());
    }
    onClose() {
        this.opened = false
    }
    onOpen() {
        this.GetRandomWeapon();
        this.close();
    }

    async GetRandomWeapon() {
        var id = Math.floor(Math.random() * 3);
        switch (id) {
          case 0:
            luckyBox.textContent = "You obtained a pistol";
            // this.player.weapon.mesh.dispose();
            const pistol = await new Pistol()
            await pistol.init()
            this.player.changeWeapon(pistol);
            break;
          case 1:
            luckyBox.textContent = "You obtained a sniper";
            // Change the weapon to a sniper (provide the appropriate sniper class)
            break;
          case 2:
            luckyBox.textContent = "You obtained an AK 74";
            this.player.weapon.mesh.dispose();
            const assault = await new Assault()
            await assault.init()
            this.player.changeWeapon(assault);
            break;
          default:
            break;
        }
    }
      
}

var openRot =  [{
    frame: 0,
    value: new BABYLON.Vector3(0, 0 ,0),
}];
openRot.push({
    frame: 60,
    value: new BABYLON.Vector3(Math.PI/2, 0, 0),
})

var closeRot =  [{
    frame: 0,
    value:  new  BABYLON.Vector3(Math.PI/2, 0, 0),
}];
closeRot.push({
    frame: 30,
    value:new BABYLON.Vector3(0, 0 ,0),
})