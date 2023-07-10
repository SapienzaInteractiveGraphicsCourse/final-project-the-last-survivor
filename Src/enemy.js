"use strict";
import * as BABYLON from "@babylonjs/core";
import { scene } from "../main";
import * as YUKA from '../Modules/yuka.module.js'

import { engine, navigation } from "./scene";
import { Vehicle } from "../Modules/yuka.module";

export class Enemy extends Vehicle {

    pathHelper;
    playerRef
    //position;
    id;
    scene;
    mesh;
    speed = 1;
    died= 0;
    c;
    done = false;
    moveTimeout = 5;
    moveTime = 5;
    timeFromLastMove= 0;
    _init = false;
    hp = 100;

    constructor(scene, player, id) {
        super()
        
        this.id = id;
        this.scene = scene;
        this.playerRef = player; 
    }
    async init(clone, position){
        this.LoadMesh(scene, position)   
        await this.mesh
        this.setMesh(clone)
        this._init = true
    }

    update() {
       
        if(this.died == 1 || !this._init) return;
            this.moveTime+= engine.getDeltaTime()/1000
        if(this.moveTime > this.moveTimeout) {
            this.moveTime=0
            this.findPathTo()
        }
    }
    
    takeDamage() {
        var dmg = this.playerRef.getDamage()
        
        this.hp -= dmg
        console.log("Hp : " + this.hp)

        if(this.hp <= 0) {
            console.log("dead")
            this.mesh.dispose()
            return true
        }
        else 
            return false
    }

    getId() {
        return this.id;
    }

    findPathTo() {
        if(this.died) return;
        var from = this.mesh.position
        var _from =  new YUKA.Vector3(this.mesh.position.x , this.mesh.position.y, this.mesh.position.z) 
        var playerPos = this.playerRef.getUserposition();
        var to = new YUKA.Vector3(playerPos.x , playerPos.y, playerPos.z) 
        
        const path = navigation.findPath(_from, to)

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
                frame: length*100/this.speed,
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

    async LoadMesh(scene,position) {
        const box = await BABYLON.MeshBuilder.CreateBox("box", {width: .3, depth: .3, height: .3}, scene);  
        box.visibility= 1;

        box.checkCollisions = true;
        box.name = "enemy";
        box.isPickable = true;  
        this.mesh = box;

        var pos = this.getPosition(position);
        box.position = pos;
    }

    setMesh(clone) {
        clone.parent = this.mesh;
    }
}

