"use strict";
import * as BABYLON from "@babylonjs/core";
import { Sound } from "@babylonjs/core";
import { scene } from "../main";
import * as YUKA from '../Modules/yuka.module.js'
import {enemy, difficulty} from "../main"
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
    head
    R_wrist

    _walk

    hit_sound;
    attack_sound;
    died_sound;
    constructor(scene, player, id) {
        super()

        if (difficulty=== "EASY"){
            this.hp = 50;
        }
        else if (difficulty === "INSANE"){
            this.hp = 150;
        }
        
        this.id = id;
        this.scene = scene;
        this.playerRef = player; 
        
        this.mesh = enemy;
        this.L_leg = this.mesh.getChildren(((m) => m.name == "L_leg"), false);
         this.R_leg = this.mesh.getChildren(((m) => m.name == "R_leg"), false);
         this.L_arm = this.mesh.getChildren(((m) => m.name == "L_arm"), false);
         this.R_arm= this.mesh.getChildren(((m) => m.name == "R_arm"), false);
         this.R_wrist= this.mesh.getChildren(((m) => m.name == "R_wrist"), false);
         this.head= this.mesh.getChildren(((m) => m.name == "head"), false);

         this.hit_sound = new Sound("Music", "Assets/zombie_hit_sound.mp3", scene);
         this.died_sound = new Sound("Music", "Assets/zombie_die_sound.mp3", scene);
         this.attack_sound = new Sound("Music", "Assets/zombie_sound.mp3", scene);
         this.attack_sound.refDistance = 0.01; // Adjust the value to your desired reference distance
         this.died_sound.refDistance = 0.1; // Adjust the value to your desired reference distance
         this.hit_sound.refDistance = 0.1; // Adjust the value to your desired reference distance


         this.hit_sound.attachToMesh(this.mesh);
         this.died_sound.attachToMesh(this.mesh);
         this.attack_sound.attachToMesh(this.mesh);



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
            setTimeout(this.playRandomAttackSound.bind(this),  Math.random() * (5 - 2) + 2)
            this.findPathTo()
        }
    }
    playRandomAttackSound() {
        // Play the attack sound
        this.attack_sound.play();
    }
    
    
    takeDamage() {
        var dmg = this.playerRef.getDamage()
        
        this.hp -= dmg
        console.log("Hp : " + this.hp)
        if(this.hp <= 0) {
            this.died_sound.play();
            console.log("dead")
            this.mesh.dispose()
            return true
        }
        else {
            this.hit_sound.play()
            return false
        }
    }

    getId() {
        return this.id;
    }

    findPathTo() {
        if(this.died) return;
        var from = this.mesh.position
        var _from =  new YUKA.Vector3(this.mesh.position.x , this.mesh.position.y, this.mesh.position.z) 
        var playerPos = this.playerRef.getUserposition();
        try {
            var to = new YUKA.Vector3(playerPos.x, playerPos.y, playerPos.z);
        } catch (error) {
            console.error("Error occurred while creating YUKA.Vector3:", error);
            this.moveTime = this.moveTimeout;
            return;
        }
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
        // console.log(path)
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
        {this.calling_walk();}
        scene.beginAnimation(this.mesh, 0, 180);
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
var L_leg_frames_rotation= []

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
                value:new BABYLON.Vector3(-19.338,-0.843,3.136)
                });
                L_leg_frames_position.push(
                {
                frame: 6,
                value:new BABYLON.Vector3(-19.169,3.189,3.215)
                });
                L_leg_frames_position.push(
                {
                frame: 8,
                value:new BABYLON.Vector3(-19,7.222,3.293)
                });
                L_leg_frames_position.push(
                {
                frame: 10,
                value:new BABYLON.Vector3(-18.831,11.255,3.371)
                });
              
                L_leg_frames_position.push(
                {
                frame: 20,
                value:new BABYLON.Vector3(-18.748,-7.936,3.674)
                });
                L_leg_frames_position.push(
                {
                frame: 22,
                value:new BABYLON.Vector3(-18.757,-13.618,3.7)
                });
                L_leg_frames_position.push(
                {
                frame: 24,
                value:new BABYLON.Vector3(-18.751,-18.84,3.681)
                });
                L_leg_frames_position.push(
                {
                frame: 26,
                value:new BABYLON.Vector3(-18.719,-23.142,3.601)
                });
                L_leg_frames_position.push(
                {
                frame: 28,
                value:new BABYLON.Vector3(-18.65,-26.064,3.445)
                });
                L_leg_frames_position.push(
                {
                frame: 30,
                value:new BABYLON.Vector3(-18.534,-27.145,3.2)
                }); 
                L_leg_frames_position.push(
                {
                frame: 40,
                value:new BABYLON.Vector3(-11.938,-8.504,2.021)
                });
                L_leg_frames_rotation.push(
                {
                frame: 0,
                value:new BABYLON.Quaternion(-0.003,1,-0.02,0.023)
                });
                L_leg_frames_rotation.push(
                {
                frame: 2,
                value:new BABYLON.Quaternion(-0.003,1,-0.02,0.023)
                });
                L_leg_frames_rotation.push(
                {
                frame: 40,
                value:new BABYLON.Quaternion(-0.003,1,-0.02,0.023)
                });

var R_leg_frames_position = []
var R_leg_frames_rotation= []

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
                value:new BABYLON.Vector3(8.203,-9.529,4.511)
                });
                R_leg_frames_position.push(
                {
                frame: 6,
                value:new BABYLON.Vector3(7.621,-14.783,4)
                });
                R_leg_frames_position.push(
                {
                frame: 8,
                value:new BABYLON.Vector3(7.039,-20.037,3.49)
                });
                R_leg_frames_position.push(
                {
                frame: 10,
                value:new BABYLON.Vector3(6.458,-25.29,2.98)
                });
                
                R_leg_frames_position.push(
                {
                frame: 20,
                value:new BABYLON.Vector3(6.484,-5.817,3.477)
                });
                R_leg_frames_position.push(
                {
                frame: 22,
                value:new BABYLON.Vector3(6.554,-0.053,3.614)
                });
                R_leg_frames_position.push(
                {
                frame: 24,
                value:new BABYLON.Vector3(6.608,5.243,3.742)
                });
                R_leg_frames_position.push(
                {
                frame: 26,
                value:new BABYLON.Vector3(6.629,9.605,3.85)
                });
                R_leg_frames_position.push(
                {
                frame: 28,
                value:new BABYLON.Vector3(6.602,12.566,3.931)
                });
                R_leg_frames_position.push(
                {
                frame: 30,
                value:new BABYLON.Vector3(6.509,13.657,3.975)
                });
               
                R_leg_frames_position.push(
                {
                frame: 40,
                value:new BABYLON.Vector3(3.682,-3.124,3.706)
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
                frame: 40,
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
                frame: 40,
                value:new BABYLON.Quaternion(-0.095,-0.729,0.045,0.676)
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
                frame: 40,
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
                value:new BABYLON.Quaternion(0.092,0.731,-0.108,0.668)
                });
                R_arm_frames_rotation.push(
                {
                frame: 6,
                value:new BABYLON.Quaternion(0.162,0.681,-0.161,0.696)
                });
                R_arm_frames_rotation.push(
                {
                frame: 8,
                value:new BABYLON.Quaternion(0.23,0.623,-0.213,0.717)
                });
                R_arm_frames_rotation.push(
                {
                frame: 10,
                value:new BABYLON.Quaternion(0.294,0.56,-0.261,0.729)
                });
                R_arm_frames_rotation.push(
                {
                frame: 20,
                value:new BABYLON.Quaternion(0.128,0.842,0.385,0.355)
                });
                R_arm_frames_rotation.push(
                {
                frame: 22,
                value:new BABYLON.Quaternion(0.123,0.848,0.37,0.36)
                });
                R_arm_frames_rotation.push(
                {
                frame: 24,
                value:new BABYLON.Quaternion(0.115,0.853,0.34,0.38)
                });
                R_arm_frames_rotation.push(
                {
                frame: 26,
                value:new BABYLON.Quaternion(0.103,0.856,0.297,0.411)
                });
                R_arm_frames_rotation.push(
                {
                frame: 28,
                value:new BABYLON.Quaternion(0.089,0.855,0.245,0.449)
                });
                R_arm_frames_rotation.push(
                {
                frame: 30,
                value:new BABYLON.Quaternion(0.073,0.848,0.188,0.49)
                });
                R_arm_frames_rotation.push(
                {
                frame: 40,
                value:new BABYLON.Quaternion(0.02,0.793,-0.008,0.609)
                });


var head_frames_position = []
var head_frames_rotation= []

                head_frames_position.push(
                {
                frame: 0,
                value:new BABYLON.Vector3(0,0,-14.207)
                });
                head_frames_position.push(
                {
                frame: 2,
                value:new BABYLON.Vector3(0,0,-14.207)
                });
                head_frames_position.push(
                {
                frame: 40,
                value:new BABYLON.Vector3(0,0,-14.207)
                });
                head_frames_rotation.push(
                {
                frame: 0,
                value:new BABYLON.Quaternion(0.099,0.383,0.038,0.918)
                });
                head_frames_rotation.push(
                {
                frame: 2,
                value:new BABYLON.Quaternion(0.099,0.383,0.038,0.918)
                });
                head_frames_rotation.push(
                {
                frame: 4,
                value:new BABYLON.Quaternion(0.106,0.299,0.021,0.948)
                });
                head_frames_rotation.push(
                {
                frame: 6,
                value:new BABYLON.Quaternion(0.112,0.211,0.004,0.971)
                });
                head_frames_rotation.push(
                {
                frame: 8,
                value:new BABYLON.Quaternion(0.118,0.122,-0.014,0.985)
                });
                head_frames_rotation.push(
                {
                frame: 10,
                value:new BABYLON.Quaternion(0.122,0.033,-0.031,0.992)
                });
                head_frames_rotation.push(
                {
                frame: 20,
                value:new BABYLON.Quaternion(0.127,-0.175,-0.07,0.974)
                });
                head_frames_rotation.push(
                {
                frame: 22,
                value:new BABYLON.Quaternion(0.127,-0.163,-0.067,0.976)
                });
                head_frames_rotation.push(
                {
                frame: 24,
                value:new BABYLON.Quaternion(0.127,-0.128,-0.061,0.982)
                });
                head_frames_rotation.push(
                {
                frame: 26,
                value:new BABYLON.Quaternion(0.125,-0.074,-0.051,0.988)
                });
                head_frames_rotation.push(
                {
                frame: 28,
                value:new BABYLON.Quaternion(0.123,-0.008,-0.039,0.992)
                });
                head_frames_rotation.push(
                {
                frame: 30,
                value:new BABYLON.Quaternion(0.12,0.064,-0.025,0.99)
                });
                head_frames_rotation.push(
                {
                frame: 40,
                value:new BABYLON.Quaternion(0.106,0.299,0.021,0.948)
                });

var R_wrist_frames_position = []
var R_wrist_frames_rotation= []

                R_wrist_frames_position.push(
                {
                frame: 0,
                value:new BABYLON.Vector3(0,0,-26.698)
                });
                R_wrist_frames_position.push(
                {
                frame: 2,
                value:new BABYLON.Vector3(0,0,-26.698)
                });
                R_wrist_frames_position.push(
                {
                frame: 40,
                value:new BABYLON.Vector3(0,0,-26.698)
                });
                
                R_wrist_frames_rotation.push(
                {
                frame: 0,
                value:new BABYLON.Quaternion(0.121,-0.004,0.175,0.977)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 2,
                value:new BABYLON.Quaternion(0.121,-0.004,0.175,0.977)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 4,
                value:new BABYLON.Quaternion(0.174,-0.058,0.138,0.973)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 6,
                value:new BABYLON.Quaternion(0.226,-0.114,0.098,0.962)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 8,
                value:new BABYLON.Quaternion(0.277,-0.168,0.058,0.944)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 10,
                value:new BABYLON.Quaternion(0.324,-0.22,0.018,0.92)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 20,
                value:new BABYLON.Quaternion(-0.052,0.364,-0.176,0.913)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 22,
                value:new BABYLON.Quaternion(-0.049,0.359,-0.176,0.915)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 24,
                value:new BABYLON.Quaternion(-0.042,0.343,-0.175,0.922)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 26,
                value:new BABYLON.Quaternion(-0.031,0.319,-0.174,0.931)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 28,
                value:new BABYLON.Quaternion(-0.017,0.29,-0.173,0.941)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 30,
                value:new BABYLON.Quaternion(-0.002,0.258,-0.171,0.951)
                });
                R_wrist_frames_rotation.push(
                {
                frame: 40,
                value:new BABYLON.Quaternion(0.048,0.148,-0.163,0.974)
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
        
        _anim = new BABYLON.Animation("head", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(head_frames_position);
        group.addTargetedAnimation(_anim, this.head);

        _anim = new BABYLON.Animation("head", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(head_frames_rotation);
        group.addTargetedAnimation(_anim, this.head);

        _anim = new BABYLON.Animation("r_wrist", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(R_wrist_frames_position);
        group.addTargetedAnimation(_anim, this.R_wrist);

        _anim = new BABYLON.Animation("r_wrist", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(R_wrist_frames_rotation);
        group.addTargetedAnimation(_anim, this.R_wrist);
        group.play(group.loopAnimation);

        this._walk=group;
    }

    calling_walk()
    {
        this._walk.play(false, 40);
    }
}

