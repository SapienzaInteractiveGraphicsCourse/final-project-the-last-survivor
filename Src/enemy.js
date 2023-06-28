"use strict";
import * as BABYLON from "@babylonjs/core";
import {camera,engine, mapMesh} from './scene';
import { SceneLoader } from "@babylonjs/core";

export class Enemy {
    navigation;
    constructor(scene) {
        this.LoadMesh(scene) 
        this.createNavigationMesh()
    }

    update() {
      
    }

    createNavigationMesh() {
        
        //let navigationPlugin = new BABYLON.RecastJSPlugin();

    }

    async LoadMesh(scene) {

        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "Assets/", "ct_gign.glb", scene)     

        const enemy = res.meshes[0];
        enemy.scaling = new BABYLON.Vector3(.02, .02, .02);
        // Parent the dude to the camera so that he'll go along its position

        enemy.position = new BABYLON.Vector3(14, 3, 15);
        enemy.rotation = new BABYLON.Vector3(0,0,0);
        // Position the dude relative to the camera: a little on the front
        // and a little below
        
        enemy.computeWorldMatrix();
        
        scene.stopAllAnimations();
        
        enemy.renderingGroupId = 1;

        //enemy.physicsImpostor = new BABYLON.PhysicsImpostor(enemy,BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 1 }, scene);

        res.meshes.forEach((m) => {
            m.checkCollisions = true;
        });


    }
}

const NavMeshParameters = {
    cs: 0.2,
    ch: 0.2,
    walkableSlopeAngle: 35,
    walkableHeight: 1,
    walkableClimb: 1,
    walkableRadius: 1,
    maxEdgeLen: 12,
    maxSimplificationError: 1.3,
    minRegionArea: 8,
    mergeRegionArea: 20,
    maxVertsPerPoly: 6,
    detailSampleDist: 6,
    detailSampleMaxError: 1,
  };