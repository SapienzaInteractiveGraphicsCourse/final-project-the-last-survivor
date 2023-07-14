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
    neck
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
         this.head= this.mesh.getChildren(((m) => m.name == "head"), false);
         this.neck= this.mesh.getChildren(((m) => m.name == "neck"), false);
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
        
        scene.beginAnimation(this.mesh, 0, 180);
        {this.calling_walk();}
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
        var neck_frames_rotation= []

        neck_frames_rotation.push(
        {
        frame: 0,
        value:new BABYLON.Vector3(-0.266,  -0.291, 0.769)
        });
        neck_frames_rotation.push(
            {
            frame: 30,
            value:new BABYLON.Vector3(-0.449,  0.0738,  -0.677)
            });
        
        neck_frames_rotation.push(
            {
            frame: 60,
            value:new BABYLON.Vector3(-0.266,  -0.291,  0.769)
            });

            var L_leg_frames_position= []

                    L_leg_frames_position.push(
                    {
                    frame: 0,
                    value:new BABYLON.Vector3(-19.507,-3.136,-3.641)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 10,
                    value:new BABYLON.Vector3(-19.507,-3.129,-3.758)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 20,
                    value:new BABYLON.Vector3(-19.507,-2.358,-15.969)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 30,
                    value:new BABYLON.Vector3(-19.507,-4.29,14.642)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 40,
                    value:new BABYLON.Vector3(-19.507,-2.358,-15.969)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 50,
                    value:new BABYLON.Vector3(-19.507,-4.29,14.642)
                    });

                    L_leg_frames_position.push(
                    {
                    frame: 60,
                    value:new BABYLON.Vector3(-19.507,-3.136,-3.641)
                    });
                    var R_leg_frames_position= []
                    R_leg_frames_position.push(
                        {
                        frame: 0,
                        value:new BABYLON.Vector3(7.752,-6.358,-0.969)
                        });
                       
                        R_leg_frames_position.push(
                        {
                        frame: 10,
                        value:new BABYLON.Vector3(7.752,-4.775,-26.049)
                        });
                        
                        R_leg_frames_position.push(
                        {
                        frame: 20,
                        value:new BABYLON.Vector3(7.752,-7.574,18.298)
                        });
                        R_leg_frames_position.push(
                        {
                        frame: 30,
                        value:new BABYLON.Vector3(7.752,-5.646,-12.256)
                        });
                        
                        R_leg_frames_position.push(
                        {
                        frame: 40,
                        value:new BABYLON.Vector3(7.752,-7.574,18.298)
                        });
                        
                        R_leg_frames_position.push(
                        {
                        frame: 50,
                        value:new BABYLON.Vector3(7.752,-5.646,-12.256)
                        });
                       
                        R_leg_frames_position.push(
                        {
                        frame: 60,
                        value:new BABYLON.Vector3(7.752,-6.358,-0.969)
                        });

                        var R_arm_frames_rotation= []


R_arm_frames_rotation.push(
{
frame: 0,
value:new BABYLON.Vector3(0.093, 0.189,  1.94)
});

R_arm_frames_rotation.push(
{
frame: 10,
value:new BABYLON.Vector3( 0.00022, 0.34,  1.85)
});

R_arm_frames_rotation.push(
{
frame: 20,
value:new BABYLON.Vector3( -0.056, 0.66, 1.62)
});

R_arm_frames_rotation.push(
{
frame: 30,
value:new BABYLON.Vector3(-0.0133, 0.847,  1.507)
});

R_arm_frames_rotation.push(
{
frame: 40,
value:new BABYLON.Quaternion(0.49,  -0.43,  2.18)
});

R_arm_frames_rotation.push(
{
frame: 50,
value:new BABYLON.Quaternion(0.24,  -0.13, 2.1)
});

R_arm_frames_rotation.push(
{
frame: 60,
value:new BABYLON.Quaternion(0.093,  0.19, 1.9)
});

                var group = new BABYLON.AnimationGroup("walking");
        
                var _anim = new BABYLON.Animation("l_leg", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                 _anim.setKeys(L_leg_frames_position);
                 group.addTargetedAnimation(_anim,this.L_leg);
        
                  _anim = new BABYLON.Animation("r_leg", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                _anim.setKeys(R_leg_frames_position);
                group.addTargetedAnimation(_anim,this.R_leg);
        
        
                //  _anim = new BABYLON.Animation("l_arm", "position", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(L_arm_frames_position);
                // group.addTargetedAnimation(_anim,this.L_arm);
        
                // _anim = new BABYLON.Animation("l_arm", "rotation", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(L_arm_frames_rotation);
                // group.addTargetedAnimation(_anim,this.L_arm);
        
                // _anim = new BABYLON.Animation("r_arm", "position", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(R_arm_frames_position);
                // group.addTargetedAnimation(_anim, this.R_arm);
        
                _anim = new BABYLON.Animation("r_arm", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                _anim.setKeys(R_arm_frames_rotation);
                group.addTargetedAnimation(_anim, this.R_arm);

                _anim = new BABYLON.Animation("neck", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                _anim.setKeys(neck_frames_rotation);
                group.addTargetedAnimation(_anim, this.neck);
                
                // _anim = new BABYLON.Animation("head", "position", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(head_frames_position);
                // group.addTargetedAnimation(_anim, this.head);
        
                // _anim = new BABYLON.Animation("head", "rotation", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(head_frames_rotation);
                // group.addTargetedAnimation(_anim, this.head);
        
                // _anim = new BABYLON.Animation("r_wrist", "position", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(R_wrist_frames_position);
                // group.addTargetedAnimation(_anim, this.R_wrist);
        
                // _anim = new BABYLON.Animation("r_wrist", "rotation", 40, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // _anim.setKeys(R_wrist_frames_rotation);
                // group.addTargetedAnimation(_anim, this.R_wrist);
                // group.play(group.loopAnimation);
        
        
                this._walk=group;
    }

    calling_walk()
    {
        this._walk.play(false, 40);
    }
}

