"use strict";
import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { SceneLoader } from "@babylonjs/core";
import * as CANNON from "cannon";
import { scene } from "../main";
import * as YUKA from '../Modules/yuka.module.js'

import { navigation } from "./scene";
import { Vehicle } from "../Modules/yuka.module";

export class Enemy extends Vehicle {

    pathHelper;
    playerRef
    //position;
    scene;
    mesh;
    c;
    done = false;
    constructor(scene, player) {
        super()
        const followPathBehavior = new YUKA.FollowPathBehavior()
        followPathBehavior.nextWaypointDistance = 0.5
        followPathBehavior.active = false
        this.steering.add(followPathBehavior)

        this.maxSpeed = 1.5
        this.maxForce = 10
        this.navMesh = navigation

        this.scene = scene;
        this.currentRegion = null
        this.fromRegion = null
        this.toRegion = null
        this.playerRef = player;

        this.LoadMesh(scene) 

        scene.onKeyboardObservable.add((kbInfo) => {
            
            switch (kbInfo.type) {
              case BABYLON.KeyboardEventTypes.KEYDOWN:
                if(kbInfo.event.key == 'p')
                   this.findPathTo();
            }
          });
        
    }

    update(delta) {
        super.update(delta)
 
    }
    
    
    findPathTo() {
        var from = this.mesh.position
        var _from =  new YUKA.Vector3(this.mesh.position.x , this.mesh.position.y, this.mesh.position.z) 
        var playerPos = this.playerRef.getUserposition();
        var to = new YUKA.Vector3(playerPos.x , playerPos.y, playerPos.z) 
        
        const path = navigation.findPath(_from, to)
        console.log(path)

        if (this.pathHelper) {
            this.pathHelper.dispose()
        }
        this.pathHelper = BABYLON.MeshBuilder.CreateLines(
            'path-helper',
            {
              points: path,
              updatable: false,
            },
            this.scene
          )
          this.pathHelper.color = BABYLON.Color3.Red()

        var newPath = [];

        path.forEach(vec => {
            var pos = new BABYLON.Vector3(vec.x,vec.y,vec.z)
            newPath.push(pos);
        })
        console.log(newPath);

        if (newPath && newPath.length > 0) {
            var length = 0;
            var direction = [{
                frame: 0,
                value: from
        }];
        
        for (var i = 0; i < newPath.length; i++) {

            var vector = new BABYLON.Vector3(newPath[i].x, newPath[i].y, newPath[i].z);

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
        var length = 100;

        if(this.done) {
            //this.mesh.subMeshes.forEach((m) => m.isPickable = false)
            this.mesh.isPickable  = false;
        }
            

        var ray = new BABYLON.Ray(position, _direction, length);
        var hit = scene.pickWithRay(ray);
        hit.fastCheck = true;

        if(this.done) {
            //this.mesh.subMeshes.forEach((m) => m.isPickable = true)
            this.mesh.isPickable  = true;
        }
        
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
        var pos = this.getPosition(new BABYLON.Vector3(1.1082477934775106,  1.31716100519502155,  11.913428243630761));

        const box = BABYLON.MeshBuilder.CreateBox("box", {width: .3, depth: .3, height: .3}, scene);  
        box.visibility= 1;

        //box.setPivotPoint(new BABYLON.Vector3( 0, -1, 0))
        box.position = pos;
        box.visibility = 0;
        box.checkCollisions = true;
        box.name = "enemy";
        box.isPickable = true;
        enemy.isPickable = false;
        enemy.name = 'enemy'
        enemy.parent = box;
        
        enemy.computeWorldMatrix();
        //box.computeWorldMatrix();
        scene.stopAllAnimations();
        
        
        this.mesh = box;
        this.done= true;
    }
}

