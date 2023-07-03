"use strict";
import * as BABYLON from "@babylonjs/core";
import {camera,engine, navigation} from './scene';
import { SceneLoader } from "@babylonjs/core";
import * as CANNON from "cannon";
import { scene } from "../main";


var line = null

export class Enemy {

    
    playerRef
    navigation;
    position;
    mesh;
    c;
    done = false;
    constructor(scene, player) {
        
        this.playerRef = player;
        this.LoadMesh(scene) 

        scene.onKeyboardObservable.add((kbInfo) => {
            
            switch (kbInfo.type) {
              case BABYLON.KeyboardEventTypes.KEYDOWN:
                if(kbInfo.event.key == 'p')
                   this.pathTowardPlayer();
            }
          });
        
    }
    update() {
      
    }

    pathTowardPlayer() {
        var zone = navigation.getGroup('level',this.getPosition(this.mesh.position) );
        console.log("zone " + zone)
        var path = navigation.findPath(this.getPosition(this.mesh.position),this.playerRef.getUserposition() , 'level', zone)|| [];
        console.log(path)

        if (path && path.length > 0) {
            var length = 0;
            var direction = [{
                frame: 0,
                value: this.getPosition(this.mesh.position)
        }];
        for (var i = 0; i < path.length; i++) {

            var vector = new BABYLON.Vector3(path[i].x, path[i].y, path[i].z);

            length += BABYLON.Vector3.Distance(direction[i].value, vector);
            direction.push({
                frame: length*100,
                value: vector
            });
        }
    
        for (var i = 0; i < direction.length; i++) {
            direction[i].frame /= length;
        }
    
        var moveCamera = new BABYLON.Animation("CameraMove", "position", 180/length+10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        moveCamera.setKeys(direction);
        this.mesh.animations.push(moveCamera);

        scene.beginAnimation(this.mesh, 0, 100);
        }
    }

    getPosition(position){
        
        var _direction = new BABYLON.Vector3(0, -1, 0);
        var origin = position;
        var length = 30;

        if(this.done)
            this.mesh.isPickable = false;
       
        var ray = new BABYLON.Ray(origin, _direction, length);
        var hit = scene.pickWithRay(ray);
        
        hit.fastCheck = true;

        if(this.done)
            this.mesh.isPickable = true;
        
      
        return hit.pickedPoint;
    }

    async LoadMesh(scene) {
       
        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "Assets/", "ct_gign.glb", scene)     

        const enemy = res.meshes[0];
        
        enemy.scaling = new BABYLON.Vector3(.02, .02, .02);
        enemy.rotation = new BABYLON.Vector3(0,0,0);
        enemy.checkCollisions = true;
        
        res.meshes.forEach((m) => {
            m.checkCollisions = true;
            m.name = 'enemy'
        });
        var pos = this.getPosition(new BABYLON.Vector3( -51.484893851152435,  43.033069906667876,  25.649692405985743));

        const box = BABYLON.MeshBuilder.CreateBox("box", {width: .3, depth: .3, height: .3}, scene);  
        
        
        box.visibility= 1;
        //box.setPivotPoint(new BABYLON.Vector3( 0, -1, 0))
        box.position = pos;
        box.checkCollisions = true;
        box.name = "enemy";
        box.isPickable = true;
        enemy.isPickable = false;
        enemy.name = 'enemy'
        //  enemy.parent = box;
        
        enemy.computeWorldMatrix();
        //box.computeWorldMatrix();
        scene.stopAllAnimations();
    
        this.mesh = box;
        this.done= true;
    }
}

