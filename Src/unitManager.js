"use strict";
import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { Enemy } from "./enemy";
import { scene } from "../main";
import { runData } from "./domItems";

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

        this.enemyMesh.meshes.forEach((m) => {
            m.checkCollisions = true;
            m.name = 'enemy'
            m.id = this.currentId
            
        });
        var clone = await  this.enemyMesh.meshes[0].clone("enemy", false);

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
        this.spawnedEnemy.forEach(e => {
            if(e.getId() == id)
                if(e.takeDamage()) {
                    const index = this.spawnedEnemy.indexOf(e);
                    if (index !== -1) {
                        this.spawnedEnemy.splice(index, 1);
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
                this.roundCounter++;
                this.currentId=0
                this.timeFromLastSpawn = 0
                this.spawnedEnemy = []
                this.currentSpawnNumber = this.startingSpawn * this.spawnGrowt * this.roundCounter;
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
}

const status = {
    ROUND : 0,
    PAUSE: 1,
    INIT: 2,
}