"use strict";
import * as BABYLON from "@babylonjs/core";
import { scene } from "../main";
import * as YUKA from '../Modules/yuka.module.js'
import {enemy} from "../main"
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

    L_leg
    R_leg
    L_arm
    R_arm

    _walk
    constructor(scene, player, id) {
        super()
        
        this.id = id;
        this.scene = scene;
        this.playerRef = player; 
        
        this.mesh = enemy;
        this.L_leg = this.mesh.getChildren(((m) => m.name == "L_leg"), false);
         this.R_leg = this.mesh.getChildren(((m) => m.name == "R_leg"), false);
         this.L_arm = this.mesh.getChildren(((m) => m.name == "L_arm"), false);
         this.R_arm= this.mesh.getChildren(((m) => m.name == "R_arm"), false);
         this.WalkingAnimation();
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

        const directionToPlayer = new BABYLON.Vector3(to.x - from.x, to.y - from.y, to.z - from.z);
        // Calculate the rotation angle towards the player
        const rotationAngle = Math.atan2(directionToPlayer.x, directionToPlayer.z);

        // Get the current rotation angle of the mesh around the y-axis
        const currentRotation = this.mesh.rotation.y;

        // Adjust the target rotation if it should be in the opposite direction
        let targetRotation = rotationAngle;
        if (currentRotation - rotationAngle > Math.PI) {
            targetRotation += 2 * Math.PI;
        } else if (rotationAngle - currentRotation > Math.PI) {
            targetRotation -= 2 * Math.PI;
        }

        // Create rotation animation
        const rotateAnimation = new BABYLON.Animation(
            "RotateAnimation",
            "rotation",
            60,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        const rotateKeys = [
            {
                frame: 0,
                value: this.mesh.rotation,
            },
            {
                frame: 50,
                value: new BABYLON.Vector3(0, targetRotation, 0),
            },
        ];

        rotateAnimation.setKeys(rotateKeys);
        this.mesh.animations.push(rotateAnimation);

        const path = navigation.findPath(_from, to);
        console.log(path)
        var newPath = [];
        
        if (path===0){
            return
        }
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
        this.calling_walk();
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
        box.visibility = 0;
        this.mesh = box;

        var pos = this.getPosition(position);
        box.position = pos;
    }

    setMesh(clone) {
        clone.parent = this.mesh;
    }
    WalkingAnimation ()
    {
        var L_leg_frames_position = []
       
        
        L_leg_frames_position.push(
            {
            frame: 0,
            value:new BABYLON.Vector3(-19.507,-4.876,3.058)
            });
            L_leg_frames_position.push(
            {
            frame: 2,
            value:new BABYLON.Vector3(-19.507,-4.876,3.058)
            });
            L_leg_frames_position.push(
            {
            frame: 4,
            value:new BABYLON.Vector3(-19.375,-4.59,3.051)
            });
            L_leg_frames_position.push(
            {
            frame: 6,
            value:new BABYLON.Vector3(-19.022,-3.962,2.988)
            });
            L_leg_frames_position.push(
            {
            frame: 8,
            value:new BABYLON.Vector3(-18.506,-3.337,2.803)
            });
            L_leg_frames_position.push(
            {
            frame: 10,
            value:new BABYLON.Vector3(-17.887,-3.061,2.434)
            });
            L_leg_frames_position.push(
            {
            frame: 12,
            value:new BABYLON.Vector3(-17.236,-5.14,1.887)
            });
            L_leg_frames_position.push(
            {
            frame: 14,
            value:new BABYLON.Vector3(-16.622,-10.077,1.28)
            });
            L_leg_frames_position.push(
            {
            frame: 16,
            value:new BABYLON.Vector3(-16.108,-15.965,0.719)
            });
            L_leg_frames_position.push(
            {
            frame: 18,
            value:new BABYLON.Vector3(-15.755,-20.896,0.306)
            });
            L_leg_frames_position.push(
            {
            frame: 20,
            value:new BABYLON.Vector3(-15.623,-22.964,0.145)
            });

        var R_leg_frames_position = []


        R_leg_frames_position.push(
            {
            frame: 0,
            value:new BABYLON.Vector3(8.784,-4.275,5.021)
            });
            R_leg_frames_position.push(
            {
            frame: 2,
            value:new BABYLON.Vector3(8.784,-4.275,5.021)
            });
            R_leg_frames_position.push(
            {
            frame: 4,
            value:new BABYLON.Vector3(8.452,-7.044,4.644)
            });
            R_leg_frames_position.push(
            {
            frame: 6,
            value:new BABYLON.Vector3(7.72,-13.137,3.815)
            });
            R_leg_frames_position.push(
            {
            frame: 8,
            value:new BABYLON.Vector3(6.988,-19.229,2.987)
            });
            R_leg_frames_position.push(
            {
            frame: 10,
            value:new BABYLON.Vector3(6.656,-21.998,2.61)
            });
            R_leg_frames_position.push(
            {
            frame: 12,
            value:new BABYLON.Vector3(7.113,-19.027,2.573)
            });
            R_leg_frames_position.push(
            {
            frame: 14,
            value:new BABYLON.Vector3(8.205,-11.941,2.483)
            });
            R_leg_frames_position.push(
            {
            frame: 16,
            value:new BABYLON.Vector3(9.507,-3.484,2.376)
            });
            R_leg_frames_position.push(
            {
            frame: 18,
            value:new BABYLON.Vector3(10.599,3.602,2.287)
            });
            R_leg_frames_position.push(
            {
            frame: 20,
            value:new BABYLON.Vector3(11.056,6.573,2.249)
            });

        var L_arm_frames_position = []
        var L_arm_frames_rotation= []

        L_arm_frames_position.push(
            {
            frame: 0,
            value:new BABYLON.Vector3(0,0,-11.614)
            });
            L_arm_frames_position.push(
            {
            frame: 2,
            value:new BABYLON.Vector3(0,0,-11.614)
            });
            L_arm_frames_position.push(
            {
            frame: 20,
            value:new BABYLON.Vector3(0,0,-11.614)
            });
            L_arm_frames_rotation.push(
            {
            frame: 0,
            value:new BABYLON.Quaternion(-0.095,-0.729,0.045,0.676)
            });
            L_arm_frames_rotation.push(
            {
            frame: 2,
            value:new BABYLON.Quaternion(-0.095,-0.729,0.045,0.676)
            });
            L_arm_frames_rotation.push(
            {
            frame: 4,
            value:new BABYLON.Quaternion(-0.113,-0.726,0.016,0.679)
            });
            L_arm_frames_rotation.push(
            {
            frame: 6,
            value:new BABYLON.Quaternion(-0.152,-0.714,-0.047,0.682)
            });
            L_arm_frames_rotation.push(
            {
            frame: 8,
            value:new BABYLON.Quaternion(-0.19,-0.698,-0.111,0.681)
            });
            L_arm_frames_rotation.push(
            {
            frame: 10,
            value:new BABYLON.Quaternion(-0.207,-0.69,-0.14,0.679)
            });
            L_arm_frames_rotation.push(
            {
            frame: 12,
            value:new BABYLON.Quaternion(-0.189,-0.699,-0.109,0.681)
            });
            L_arm_frames_rotation.push(
            {
            frame: 14,
            value:new BABYLON.Quaternion(-0.143,-0.717,-0.033,0.681)
            });
            L_arm_frames_rotation.push(
            {
            frame: 16,
            value:new BABYLON.Quaternion(-0.086,-0.731,0.059,0.674)
            });
            L_arm_frames_rotation.push(
            {
            frame: 18,
            value:new BABYLON.Quaternion(-0.039,-0.736,0.134,0.663)
            });
            L_arm_frames_rotation.push(
            {
            frame: 20,
            value:new BABYLON.Quaternion(-0.019,-0.736,0.165,0.656)
            });

        var R_arm_frames_position = []
        var R_arm_frames_rotation= []
        
        R_arm_frames_position.push(
            {
            frame: 0,
            value:new BABYLON.Vector3(-4.688,-3.952,-30.105)
            });
            R_arm_frames_position.push(
            {
            frame: 2,
            value:new BABYLON.Vector3(-4.688,-3.952,-30.105)
            });
            R_arm_frames_position.push(
            {
            frame: 20,
            value:new BABYLON.Vector3(-4.688,-3.952,-30.105)
            });
            R_arm_frames_rotation.push(
            {
            frame: 0,
            value:new BABYLON.Quaternion(0.023,0.772,-0.055,0.633)
            });
            R_arm_frames_rotation.push(
            {
            frame: 2,
            value:new BABYLON.Quaternion(0.023,0.772,-0.055,0.633)
            });
            R_arm_frames_rotation.push(
            {
            frame: 4,
            value:new BABYLON.Quaternion(0.045,0.771,-0.087,0.629)
            });
            R_arm_frames_rotation.push(
            {
            frame: 6,
            value:new BABYLON.Quaternion(0.094,0.765,-0.157,0.618)
            });
            R_arm_frames_rotation.push(
            {
            frame: 8,
            value:new BABYLON.Quaternion(0.142,0.752,-0.226,0.602)
            });
            R_arm_frames_rotation.push(
            {
            frame: 10,
            value:new BABYLON.Quaternion(0.163,0.745,-0.257,0.594)
            });
            R_arm_frames_rotation.push(
            {
            frame: 12,
            value:new BABYLON.Quaternion(0.133,0.755,-0.213,0.606)
            });
            R_arm_frames_rotation.push(
            {
            frame: 14,
            value:new BABYLON.Quaternion(0.057,0.77,-0.104,0.627)
            });
            R_arm_frames_rotation.push(
            {
            frame: 16,
            value:new BABYLON.Quaternion(-0.037,0.769,0.033,0.637)
            });
            R_arm_frames_rotation.push(
            {
            frame: 18,
            value:new BABYLON.Quaternion(-0.113,0.752,0.144,0.633)
            });
            R_arm_frames_rotation.push(
            {
            frame: 20,
            value:new BABYLON.Quaternion(-0.144,0.742,0.188,0.628)
            });


        var group = new BABYLON.AnimationGroup("walking");

        var _anim = new BABYLON.Animation("l_leg", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(L_leg_frames_position);
        group.addTargetedAnimation(_anim,this.L_leg);

         _anim = new BABYLON.Animation("r_leg", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(R_leg_frames_position);
        group.addTargetedAnimation(_anim,this.R_leg);


         _anim = new BABYLON.Animation("l_arm", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(L_arm_frames_position);
        group.addTargetedAnimation(_anim,this.L_arm);

        _anim = new BABYLON.Animation("l_arm", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(L_arm_frames_rotation);
        group.addTargetedAnimation(_anim,this.L_arm);

        _anim = new BABYLON.Animation("r_arm", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(R_arm_frames_position);
        group.addTargetedAnimation(_anim, this.R_arm);

        _anim = new BABYLON.Animation("r_arm", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(R_arm_frames_rotation);
        group.addTargetedAnimation(_anim, this.R_arm);
        
        group.play(group.loopAnimation);

        this._walk=group;
    }
    calling_walk()
    {
        this._walk.play(this._walk.loopAnimation);
    }
}



