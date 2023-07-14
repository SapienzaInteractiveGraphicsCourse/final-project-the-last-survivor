
import { Weapon } from "./weapon";
import * as BABYLON from "@babylonjs/core";

export class Pistol extends Weapon {
    ///===============================================///

    PBody 
    Pmag 
    IK_Hand_Cntrl_R 
    UpArm_R 
    IK_Hand_Cntrl_L 

    damage = 25;
    ammoLevel = 10;
    currentAmmo = 10;
    stockedAmmo = 30;
    async init() {
        await this.loadMesh("fps_pistol_animations.glb", new BABYLON.Vector3(0.1, -0.2, 0));
        ///LOAD PISTOL COMPONENTS///
        
        this.loadSound("Assets/pistol.mp3")

        this.PBody = this.mesh.getChildren(((m) => m.name == "PBody_058"), false);
        this.Pmag = this.mesh.getChildren(((m) => m.name == "Pmag_061"), false);
        this.IK_Hand_Cntrl_R = this.mesh.getChildren(((m) => m.name == "IK_Hand_Cntrl_R_037"), false);
        this.UpArm_R = this.mesh.getChildren(((m) => m.name == "UpArm_R_09"), false);
        this.IK_Hand_Cntrl_L = this.mesh.getChildren(((m) => m.name == "IK_Hand_Cntrl_L_015"), false);

        
        this.LoadShootAnimations()

    }

    LoadShootAnimations() {
        var group = new BABYLON.AnimationGroup("fire");

        var _anim = new BABYLON.Animation("Pmag_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(Pmag_Frames_position);
        group.addTargetedAnimation(_anim,this.Pmag);

        _anim = new BABYLON.Animation("PBody_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(PBody_Frames_position);
        group.addTargetedAnimation(_anim,this.PBody);

        _anim = new BABYLON.Animation("LeftHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_L_position);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_L);

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_L_rotation);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_L);

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_rotation);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);


        _anim = new BABYLON.Animation("IK_Hand_Cntrl_R", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_position);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);

        group.play(group.loopAnimation);
        this._fire = group;

        // AIM ANIMATION

        var group2 = new BABYLON.AnimationGroup("aim");

        var _anim2 = new BABYLON.Animation("Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim2.setKeys(aimKeyFrames);
        group2.addTargetedAnimation(_anim2,this.mesh);

        _anim2 = new BABYLON.Animation("Pos", "rotation", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim2.setKeys(aimrotKeyFrames);
        group2.addTargetedAnimation(_anim2,this.mesh);
    
        group2.play(group2.loopAnimation);

        this._aim = group2;
    }

}

///===========================================///
///=================KEY FRAMES================///
///===========================================///

var Pmag_Frames_position =  [{
    frame: 0,
    value:  new BABYLON.Vector3(-0.098,-0.13,0)
}];
Pmag_Frames_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.082, -0.020, 0.315),
})
Pmag_Frames_position.push({
    frame: 6,
    value: new BABYLON.Vector3(-0.082, -0.013, 0.317),
})
Pmag_Frames_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.082, -0.023, 0.338),
})
Pmag_Frames_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.082, -0.030, 0.353),
})
Pmag_Frames_position.push({
    frame: 14,
    value:  new BABYLON.Vector3(-0.098,-0.13,0)
})

//PISTOL BODY
var PBody_Frames_position = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.078, -0.0277,  0.350),
}]
PBody_Frames_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.078,  -0.0197,  0.308),
})
PBody_Frames_position.push({
    
    frame: 6,
    value: new BABYLON.Vector3(-0.078, -0.009,  0.310),
})
PBody_Frames_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.078, -0.020, 0.331),
})
PBody_Frames_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.078, -0.026, 0.346),
})
PBody_Frames_position.push({
    frame: 14,
    value: new BABYLON.Vector3(-0.078, -0.027, 0.350),
})

//LEFT HAND-postion
var IK_Hand_Cntrl_L_position = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.045, -0.037, 0.219),
}]
IK_Hand_Cntrl_L_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.045, -0.080,  0.191),
})
IK_Hand_Cntrl_L_position.push({
    frame: 6,
    value: new BABYLON.Vector3(-0.047,-0.017,0.179),
})
IK_Hand_Cntrl_L_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.0456,-0.035, 0.201),
})
IK_Hand_Cntrl_L_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.045, -0.038,  0.216),
})
IK_Hand_Cntrl_L_position.push({
    frame: 14,
    value: new BABYLON.Vector3(-0.0456, -0.0374, 0.219),
})
//LEFT HAND-rotation
var IK_Hand_Cntrl_L_rotation = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.048,-0.101,-2.811),
}]
IK_Hand_Cntrl_L_rotation .push({
    frame: 3,
    value: new BABYLON.Vector3(-0.452,-0.118,-2.758),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 6,
    value: new BABYLON.Vector3(-0.0330,-0.090,-2.808),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 9,
    value: new BABYLON.Vector3(-0.088,-0.101,-2.800),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 12,
    value: new BABYLON.Vector3(-0.062,-0.101,-2.807),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 14,
    value: new BABYLON.Vector3(-0.0482,-0.101,-2.811),
})

//right hand-position
var IK_Hand_Cntrl_R_position = [{
    frame: 0,
    value: new BABYLON.Vector3( -0.082,  0.0290,  0.218),
}]
IK_Hand_Cntrl_R_position.push({
    frame: 3,
    value: new BABYLON.Vector3( -0.082,  -0.0197,  0.164),
})
IK_Hand_Cntrl_R_position.push({
    frame: 6,
    value: new BABYLON.Vector3( -0.084, 0.049,0.179),
})
IK_Hand_Cntrl_R_position.push({
    frame: 9,
    value: new BABYLON.Vector3( -0.083, 0.031,  0.197),
})
IK_Hand_Cntrl_R_position.push({
    frame: 12,
    value: new BABYLON.Vector3( -0.083,  0.028,  0.214),
})
IK_Hand_Cntrl_R_position.push({
    frame: 14,
    value: new BABYLON.Vector3( -0.082,  0.029,  0.218),
})

//right hand-rotation
var IK_Hand_Cntrl_R_rotation = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.108,-0.042,1.120),
}]
IK_Hand_Cntrl_R_rotation .push({
    frame: 3,
    value: new BABYLON.Vector3(-0.514,-0.053,1.145),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 6,
    value: new BABYLON.Vector3(-0.093,-0.031,1.12),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 9,
    value: new BABYLON.Vector3(-0.148,-0.043,1.128),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 12,
    value: new BABYLON.Vector3(-0.122,-0.042,1.123),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 14,
    value: new BABYLON.Vector3(-0.108,-0.042,1.120),
})



var aimKeyFrames= []

aimKeyFrames.push(
{
frame: 0,
value:  new BABYLON.Vector3(0.1, -0.2, 0)
});

aimKeyFrames.push(
{
frame: 60,
value:  new BABYLON.Vector3(-0.098,-0.13,0)
});

var aimrotKeyFrames =[]


aimrotKeyFrames.push(
{
frame: 0,
value:  new BABYLON.Vector3(0,Math.PI,0)
});

aimrotKeyFrames.push(
{
frame: 60,
value:  new BABYLON.Vector3(0,Math.PI-0.1,0.22)
});