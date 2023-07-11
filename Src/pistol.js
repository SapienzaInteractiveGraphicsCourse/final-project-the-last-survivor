
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
    ammoLevel = 15;
    currentAmmo = 10;
    stockedAmmo = 20;
    async init() {
        await this.loadMesh("fps_pistol_animations.glb", new BABYLON.Vector3(0.1, -0.2, 0));
        ///LOAD PISTOL COMPONENTS///
        
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

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_L_rotation);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_L);

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_rotation);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);


        _anim = new BABYLON.Animation("IK_Hand_Cntrl_R", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_position);
        group.addTargetedAnimation(_anim,this.IK_Hand_Cntrl_R);

        group.play(group.loopAnimation);
        // group2.play(group2.loopAnimation);

        this._fire = group;
    }
}

///===========================================///
///=================KEY FRAMES================///
///===========================================///

var Pmag_Frames_position =  [{
    frame: 0,
    value: new BABYLON.Vector3(-0.082851, -0.03127084672451019 , 0.3568672239780426),
}];
Pmag_Frames_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.082851, -0.02038504183292389, 0.3155350983142853),
})
Pmag_Frames_position.push({
    frame: 6,
    value: new BABYLON.Vector3(-0.082851, -0.013306991197168827, 0.3171645998954773),
})
Pmag_Frames_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.082851, -0.02356041967868805, 0.3383954167366028),
})
Pmag_Frames_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.082851, -0.030087940394878387, 0.3536340594291687 ),
})
Pmag_Frames_position.push({
    frame: 14,
    value: new BABYLON.Vector3(-0.082851, -0.03127084672451019 , 0.3568672239780426),
})

//PISTOL BODY
var PBody_Frames_position = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.078944, -0.027720719575881958,  0.35021501779556274),
}]
PBody_Frames_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.078944,  -0.01973850280046463,  0.30802738666534424),
})
PBody_Frames_position.push({
    
    frame: 6,
    value: new BABYLON.Vector3(-0.078944, -0.009639278054237366,  0.3105216920375824),
})
PBody_Frames_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.078944, -0.020259343087673187, 0.33159953355789185),
})
PBody_Frames_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.078944, -0.026624761521816254, 0.3469301462173462),
})
PBody_Frames_position.push({
    frame: 14,
    value: new BABYLON.Vector3(-0.078944, -0.027720719575881958, 0.35021501779556274),
})

//LEFT HAND-postion
var IK_Hand_Cntrl_L_position = [{
    frame: 0,
    value: new BABYLON.Vector3(-0.04560738801956177, -0.03743438050150871, 0.21919746696949005),
}]
IK_Hand_Cntrl_L_position.push({
    frame: 3,
    value: new BABYLON.Vector3(-0.045115645974874496, -0.08035119622945786,  0.19160988926887512),
})
IK_Hand_Cntrl_L_position.push({
    frame: 6,
    value: new BABYLON.Vector3(-0.0470687672495842,-0.01724591664969921,0.1790021061897277),
})
IK_Hand_Cntrl_L_position.push({
    frame: 9,
    value: new BABYLON.Vector3(-0.04562688618898392,-0.035110026597976685, 0.20105943083763123),
})
IK_Hand_Cntrl_L_position.push({
    frame: 12,
    value: new BABYLON.Vector3(-0.04561518877744675, -0.03814832866191864,  0.21605655550956726),
})
IK_Hand_Cntrl_L_position.push({
    frame: 14,
    value: new BABYLON.Vector3(-0.04560738801956177, -0.03743438050150871, 0.21919746696949005),
})
//LEFT HAND-rotation
var IK_Hand_Cntrl_L_rotation = [{
    frame: 0,
    value: new BABYLON.Quaternion(-0.04625927656888962, 0.03213781118392944, 0.9850730299949646,  -0.16266027092933655),
}]
IK_Hand_Cntrl_L_rotation .push({
    frame: 3,
    value: new BABYLON.Quaternion(-0.014148877933621407,  0.23062171041965485,  0.9575549960136414, -0.1723421961069107),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 6,
    value: new BABYLON.Quaternion(-0.0418987050652504, 0.023788409307599068, 0.9851288795471191, -0.16492338478565216),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 9,
    value: new BABYLON.Quaternion(-0.04262944310903549, 0.05211726948618889, 0.9836558699607849, -0.16699601709842682),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 12,
    value: new BABYLON.Quaternion(-0.044984132051467896,  0.03917071968317032,  0.9846229553222656,  -0.1641942262649536),
})
IK_Hand_Cntrl_L_rotation .push({
    frame: 14,
    value: new BABYLON.Quaternion(-0.04625927656888962, 0.03213781118392944, 0.9850730299949646,  -0.16266027092933655),
})

//right hand-position
var IK_Hand_Cntrl_R_position = [{
    frame: 0,
    value: new BABYLON.Vector3( -0.0829569399356842,  0.029083557426929474,  0.2184237837791443),
}]
IK_Hand_Cntrl_R_position.push({
    frame: 3,
    value: new BABYLON.Vector3( -0.0827229917049408,  -0.019758615642786026,  0.1645091474056244),
})
IK_Hand_Cntrl_R_position.push({
    frame: 6,
    value: new BABYLON.Vector3( -0.08474674820899963, 0.04908793419599533,0.17964310944080353),
})
IK_Hand_Cntrl_R_position.push({
    frame: 9,
    value: new BABYLON.Vector3( -0.08343741297721863, 0.031060736626386642,  0.19759275019168854),
})
IK_Hand_Cntrl_R_position.push({
    frame: 12,
    value: new BABYLON.Vector3( -0.08313009142875671,  0.02826041728258133,  0.21433356404304504),
})
IK_Hand_Cntrl_R_position.push({
    frame: 14,
    value: new BABYLON.Vector3( -0.0829569399356842,  0.029083557426929474,  0.2184237837791443),
})

//right hand-rotation
var IK_Hand_Cntrl_R_rotation = [{
    frame: 0,
    value: new BABYLON.Quaternion(-0.057135988026857376,  0.01055992767214775,  0.5295121073722839,  0.8463101387023926),
}]
IK_Hand_Cntrl_R_rotation .push({
    frame: 3,
    value: new BABYLON.Quaternion(-0.22769106924533844, 0.11611448973417282,  0.5182999968528748,  0.8161123394966125),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 6,
    value: new BABYLON.Quaternion(-0.047852471470832825,  0.011341879144310951,  0.5319801568984985,  0.8453274965286255),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 9,
    value: new BABYLON.Quaternion(-0.07430554181337357,  0.02158804051578045,  0.5318422913551331, 0.8433008790016174),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 12,
    value: new BABYLON.Quaternion(-0.06318460404872894,  0.014429227448999882,  0.530504584312439,0.845200777053833),
})
IK_Hand_Cntrl_R_rotation .push({
    frame: 14,
    value: new BABYLON.Quaternion( -0.057135988026857376,  0.01055992767214775,  0.5295121073722839,  0.8463101387023926),
})