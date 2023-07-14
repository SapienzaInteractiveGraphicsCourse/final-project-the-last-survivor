"use strict";
import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { Enemy } from "./enemy";
import { scene, ammoBox1, ammoBox2, ammoBox3, ammoBox4, ammoBox5, ammoBox6, ammoBox7 } from "../main";
import { runData } from "./domItems";
import { LuckyBoxInstance } from "./luckyBox";
import { AmmoBox } from "./ammo_box"

export class UnitManager {
    static instance = null;
    player;
    enemyMesh;
    spawnedEnemy = []

    startingSpawn = 5;
    currentSpawnNumber = 5;
    spawnGrowt = 2;
    spawnRate = 1.5 //seconds between each spawn
    roundCounter = 0
    pauseSeconds = 15;
    pauseRunningTime= 15;
    currentId = 0;
    state = status.INIT;

    //se scegliamo di fare piu mappe questo valore deve essere caricato dall'esterno
    spawnPositions = [new BABYLON.Vector3(-34.69322858847461,  1.6987113952636719,  -51.69050450024815), new BABYLON.Vector3(25.37496278819124,  -2.1012885570526123,  -2.999570688714191), new BABYLON.Vector3(2.4712665111792713,-1.5012885570526123,  -42.317042814884815)]

    constructor(player,enemy) {
        UnitManager.instance = this
        this.player = player;
        this.enemyMesh = enemy;
        this.changeState(status.ROUND)
    }
    
    async spawnEnemy() {
        
        console.log(this.currentSpawnNumber)
        if(this.currentSpawnNumber <= 0)
            return;

        this.currentSpawnNumber--

        var collider = BABYLON.MeshBuilder.CreateBox("box", {width:.8, depth: 0.8, height: 3}, scene); 
        collider.visibility = 0
        collider.isPickable = false
        collider.checkCollisions = false
        collider.actionManager = new BABYLON.ActionManager(scene)

        collider.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction({ 
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, 
                    parameter:this.player.collider
                },function(player){
                    //funziona
                    console.log("player hit")
                    var sound = new BABYLON.Sound("bgs", "Assets/move.wav", scene);
                    sound.play()
                    UnitManager.instance.player.takeDamage()
                }));

        this.enemyMesh.meshes.forEach((m) => {
            m.checkCollisions = true;
            m.name = 'enemy'
            m.id = this.currentId
        });


        var clone = await  this.enemyMesh.meshes[0].clone("enemy", false);
        collider.parent = clone
        clone.id = this.currentId; 

        
        var position = this.spawnPositions[Math.floor(Math.random()*this.spawnPositions.length)]
      
        var enemy = new Enemy(scene ,this.player ,this.currentId);
        await enemy.init(clone, position)

        this.spawnedEnemy.push(enemy)
        this.currentId++;

        await BABYLON.Tools.DelayAsync(this.spawnRate*1000);
        this.spawnEnemy();
    }

    onEnemyHit(id) {
        this.player.addMoney(20)
        this.spawnedEnemy.forEach(e => {
            if(e.getId() == id)
                if(e.takeDamage()) {
                    const index = this.spawnedEnemy.indexOf(e);
                    
                    if (index !== -1) {
                        this.spawnedEnemy.splice(index, 1);
                        this.player.addMoney(150)
                    } 
                }     
        })

        if(this.spawnedEnemy.length == 0)
            this.changeState(status.PAUSE)
    }

    changeState(newState) {
        this.state = newState
        console.log("state changed to " + newState)
        switch (newState) {
            case status.ROUND:
                this.recreateAmmoBox()
                this.roundCounter++;
                this.currentId=0
                this.timeFromLastSpawn = 0
                this.spawnedEnemy = []
                this.currentSpawnNumber = this.startingSpawn * this.roundCounter;
                this.spawnEnemy();
                break;
            case status.PAUSE:
                //set timeout for the next round
                this.pauseRunningTime = this.pauseSeconds
                break;
            default:
                break;
        }
    }
    //Ad ogni update controlliamo lo stato dei nemici
    update() {
        var string = (this.state == status.PAUSE? "Pause Time " + Math.floor(this.pauseRunningTime) : "Zombie Counter: " + this.spawnedEnemy.length);
        runData.innerHTML = "Round: " + this.roundCounter + "<br/>" +  string;

        switch (this.state) {
            case status.ROUND:
                this.spawnedEnemy.forEach(e => { e.update() })
                break;
            case status.PAUSE:
                this.pauseRunningTime -= engine.getDeltaTime()/1000

                if(this.pauseRunningTime <= 0 )
                    this.changeState(status.ROUND)
                break;
            default:
                
                break;
        }
        
    }

    async recreateAmmoBox() {
        // Check if the AmmoBox is disposed
          // Recreate the AmmoBox
            await ammoBox1.LoadMesh(this.player.collider, new BABYLON.Vector3(-12.120131858364807, 2.096194466462976, 11.366266535238479), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox2.LoadMesh(this.player.collider, new BABYLON.Vector3(-32.434365573719354, 1.2420620087993939e-15, -5.600489765047536), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox3.LoadMesh(this.player.collider, new BABYLON.Vector3(-36.020856010272745, 0.5502144098281907, -20.982882899924686), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox4.LoadMesh(this.player.collider, new BABYLON.Vector3(-8.48171032805569, -1.9874416330712497, -37.62943200154321), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox5.LoadMesh(this.player.collider, new BABYLON.Vector3(21.068521746579986, 0.22930107223850799, -15.635727886442485), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox6.LoadMesh(this.player.collider, new BABYLON.Vector3(14.300432953120715, 1.650643229484568, -44.73937281514947), new BABYLON.Vector3(0, Math.PI, 0));

            await ammoBox7.LoadMesh(this.player.collider, new BABYLON.Vector3(3.115622796911797, 1.394717674685353e-15, -6.284799825043635), new BABYLON.Vector3(0, Math.PI, 0));
      }
}

const status = {
    ROUND : 0,
    PAUSE: 1,
    INIT: 2,
}