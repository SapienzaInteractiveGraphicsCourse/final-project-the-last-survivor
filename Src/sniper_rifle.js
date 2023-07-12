import { Weapon } from "./weapon";
import * as BABYLON from "@babylonjs/core";

export class Sniper extends Weapon {
  AKBody;
  AKMag;
  IK_Hand_Cntrl_R;
  UpArm_R;
  IK_Hand_Cntrl_L;

  damage = 400;
  ammoLevel = 5;
  stockedAmmo = 15;
  currentAmmo = 5;

  async init() {
    await this.loadMesh("fps_animations_sniper_rifle.glb", new BABYLON.Vector3(0.1, -0.3, -0.05));
    // Load AK47 components
    this.loadSound("Assets/sniper.mp3")
    this.sBody = this.mesh.getChildren((m) => m.name === "Body_057", false);
    this.sMag = this.mesh.getChildren((m) => m.name === "Mag_060", false);
    this.IK_Hand_Cntrl_R = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_R_036", false);
    this.sBolt = this.mesh.getChildren((m) => m.name === "Bolt_059", false);
    this.IK_Hand_Cntrl_L = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_L_014", false);


    this.loadShootAnimations();
   
  }

  loadShootAnimations() {
    var group = new BABYLON.AnimationGroup("fire");

    var _anim = new BABYLON.Animation("Pmag_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(Mag_060_frames_position);
    group.addTargetedAnimation(_anim,this.sMag);

    _anim = new BABYLON.Animation("PBody_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(Body_057_frames_position);
    group.addTargetedAnimation(_anim,this.sBody);

    _anim = new BABYLON.Animation("RightHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(IK_Hand_Cntrl_R_036_frames_position);
    group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);

    
    _anim = new BABYLON.Animation("LeftHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(IK_Hand_Cntrl_L_014_frames_position);
    group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_L);

    _anim = new BABYLON.Animation("mag", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(Mag_060_frames_position);
    group.addTargetedAnimation(_anim,this.sBolt);



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

var IK_Hand_Cntrl_R_036_frames_position = []
var Bolt_059_frames_position= []
var IK_Hand_Cntrl_L_014_frames_position= []
var Mag_060_frames_position = []
var Body_057_frames_position= []

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.155,0.15,-0.07)
});
IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 6,
value:new BABYLON.Vector3(-0.155,0.146,-0.099)
});
IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(-0.156,0.141,-0.129)
});
IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 14,
value:new BABYLON.Vector3(-0.155,0.15,-0.07)
});

Bolt_059_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(0,0.171,-0.019)
});
Bolt_059_frames_position.push(
{
frame: 7,
value:new BABYLON.Vector3(0,0.171,-0.019)
});

Bolt_059_frames_position.push(
{
frame: 14,
value:new BABYLON.Vector3(0,0.171,-0.019)
});


IK_Hand_Cntrl_L_014_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(0.015,0.032,0.26)
});
IK_Hand_Cntrl_L_014_frames_position.push(
{
frame: 6,
value:new BABYLON.Vector3(0.015,0.03,0.231)
});
IK_Hand_Cntrl_L_014_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(0.015,0.028,0.203)
});
IK_Hand_Cntrl_L_014_frames_position.push(
{
frame: 14,
value:new BABYLON.Vector3(0.015,0.032,0.26)
});



Body_057_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.075,0.065,-0.014)
});
Body_057_frames_position.push(
{
frame: 6,
value:new BABYLON.Vector3(-0.076,0.062,-0.043)
});
Body_057_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(-0.076,0.058,-0.071)
});

Body_057_frames_position.push(
{
frame: 14,
value:new BABYLON.Vector3(-0.075,0.065,-0.014)
});


Mag_060_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.068,0.079,0.259)
});
Mag_060_frames_position.push(
{
frame: 6,
value:new BABYLON.Vector3(-0.069,0.077,0.23)
});
Mag_060_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(-0.069,0.075,0.201)
});
Mag_060_frames_position.push(
{
frame: 14,
value:new BABYLON.Vector3(-0.068,0.079,0.259)
});


var aimKeyFrames= []

aimKeyFrames.push(
{
frame: 0,
value:  new BABYLON.Vector3(0.1, -0.3, -0.05)
});

aimKeyFrames.push(
{
frame: 60,
value:  new BABYLON.Vector3(-0.08, -0.24, 0.05)
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
value:  new BABYLON.Vector3(0,Math.PI,0.1)
});