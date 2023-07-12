import { Weapon } from "./weapon";
import * as BABYLON from "@babylonjs/core";

export class Assault extends Weapon {
  AKBody;
  AKMag;
  IK_Hand_Cntrl_R;
  UpArm_R;
  IK_Hand_Cntrl_L;

  damage = 20;
  ammoLevel = 30;
  stockedAmmo = 60;
  currentAmmo = 30;

  async init() {
    await this.loadMesh("fps_ak-74m_animations.glb", new BABYLON.Vector3(0.2, -0.45, 0.3));
    // Load AK47 components
    this.loadSound("Assets/ak.mp3")
    this.AKBody = this.mesh.getChildren((m) => m.name === "PBody_058", false);
    this.AKMag = this.mesh.getChildren((m) => m.name === "Pmag_062", false);
    this.IK_Hand_Cntrl_R = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_R_036", false);
    this.UpArm_R = this.mesh.getChildren((m) => m.name === "UpArm_R_09", false);
    this.IK_Hand_Cntrl_L = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_L_015", false);

    this.loadShootAnimations();
   
  }

  loadShootAnimations() {
    var group = new BABYLON.AnimationGroup("fire");

    var _anim = new BABYLON.Animation("Pmag_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(Pmag_062_frames_position);
    group.addTargetedAnimation(_anim,this.AKMag);

    _anim = new BABYLON.Animation("PBody_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(PBody_058_frames_position);
    group.addTargetedAnimation(_anim,this.AKBody);

    _anim = new BABYLON.Animation("RightHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(IK_Hand_Cntrl_R_036_frames_position);
    group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);

    
    _anim = new BABYLON.Animation("LeftHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    _anim.setKeys(IK_Hand_Cntrl_L_015_frames_position);
    group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_L);

    //group.play(group.loopAnimation);
    // group2.play(group2.loopAnimation);

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

var PBody_058_frames_position= []
var Pmag_062_frames_position = []
var IK_Hand_Cntrl_R_036_frames_position= []

PBody_058_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.044,0.121,0.267)
});
PBody_058_frames_position.push(
{
frame: 2,
value:new BABYLON.Vector3(-0.044,0.123,0.229)
});


PBody_058_frames_position.push(
{
frame: 4,
value:new BABYLON.Vector3(-0.044,0.121,0.2)
});

PBody_058_frames_position.push(
{
frame: 6,
value:new BABYLON.Vector3(-0.044,0.113,0.24)
});

PBody_058_frames_position.push(
{
frame: 8,
value:new BABYLON.Vector3(-0.044,0.117,0.262)
});
;
PBody_058_frames_position.push(
{
frame: 11,
value:new BABYLON.Vector3(-0.044,0.121,0.267)
});

Pmag_062_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.077,-0.095,0.247)
});
Pmag_062_frames_position.push(
{
frame: 3,
value:new BABYLON.Vector3(-0.084,-0.09,0.17)
});
Pmag_062_frames_position.push(
{
frame: 3,
value:new BABYLON.Vector3(-0.08,-0.093,0.179)
});

Pmag_062_frames_position.push(
{
frame: 5,
value:new BABYLON.Vector3(-0.07,-0.104,0.223)
});

Pmag_062_frames_position.push(
{
frame: 7,
value:new BABYLON.Vector3(-0.076,-0.099,0.243)
});


Pmag_062_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(-0.081,-0.094,0.245)
});

Pmag_062_frames_position.push(
{
frame: 11,
value:new BABYLON.Vector3(-0.077,-0.095,0.247)
});



IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(-0.109,-0.006,-0.114)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 3,
value:new BABYLON.Vector3(-0.113,0.004,-0.19)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 5,
value:new BABYLON.Vector3(-0.107,-0.015,-0.161)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 7,
value:new BABYLON.Vector3(-0.106,-0.018,-0.125)
});
IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 7,
value:new BABYLON.Vector3(-0.108,-0.012,-0.118)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 9,
value:new BABYLON.Vector3(-0.111,-0.004,-0.115)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 10,
value:new BABYLON.Vector3(-0.11,-0.007,-0.114)
});

IK_Hand_Cntrl_R_036_frames_position.push(
{
frame: 11,
value:new BABYLON.Vector3(-0.109,-0.006,-0.114)
});


var IK_Hand_Cntrl_L_015_frames_position= []

IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 0,
value:new BABYLON.Vector3(0.025,0.053,0.343)
});

IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 3,
value:new BABYLON.Vector3(0.023,0.054,0.268)
});

IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 5,
value:new BABYLON.Vector3(0.026,0.05,0.296)
});

IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 7,
value:new BABYLON.Vector3(0.026,0.049,0.331)
});

IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 9,
value:new BABYLON.Vector3(0.024,0.051,0.343)
});


IK_Hand_Cntrl_L_015_frames_position.push(
{
frame: 11,
value:new BABYLON.Vector3(0.025,0.053,0.343)
});


var aimKeyFrames= []

aimKeyFrames.push(
{
frame: 0,
value:  new BABYLON.Vector3(0.2, -0.45, 0.3)
});

aimKeyFrames.push(
{
frame: 60,
value:  new BABYLON.Vector3(-0.125, -0.39, -0.2)
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
value:  new BABYLON.Vector3(-0.03,Math.PI-0.03,0.1)
});