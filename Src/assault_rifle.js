import { Weapon } from "./weapon";
import * as BABYLON from "@babylonjs/core";

export class Assault extends Weapon {
  AKBody;
  AKMag;
  IK_Hand_Cntrl_R;
  UpArm_R;
  IK_Hand_Cntrl_L;

  damage = 200;
  ammoLevel = 30;
  currentAmmo = 30;

  async init() {
    await this.loadMesh("fps_ak-74m_animations.glb", new BABYLON.Vector3(0.2, -0.45, 0.3));
    // Load AK47 components

    this.AKBody = this.mesh.getChildren((m) => m.name === "AKBody", false);
    this.AKMag = this.mesh.getChildren((m) => m.name === "AKMag", false);
    this.IK_Hand_Cntrl_R = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_R", false);
    this.UpArm_R = this.mesh.getChildren((m) => m.name === "UpArm_R", false);
    this.IK_Hand_Cntrl_L = this.mesh.getChildren((m) => m.name === "IK_Hand_Cntrl_L", false);

    this.loadShootAnimations();
  }

  loadShootAnimations() {
    var group = new BABYLON.AnimationGroup("fire");

    // Define the AK47 animation keyframes

    group.play(group.loopAnimation);

    this._fire = group;
  }
}
