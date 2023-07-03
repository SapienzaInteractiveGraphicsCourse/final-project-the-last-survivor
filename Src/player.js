import * as BABYLON from "@babylonjs/core";
import {camera,engine} from './scene';
import { SceneLoader } from "@babylonjs/core";



//Class that contains all the player info

export class Player {
    //ANIMATIONS, just temporary
    _animGroup = null;
    _idle;
    _draw;
    _reload;
    _fire;
    //

    //PLAYER STATUS
    locked = false;
    status = status.IDLE;
    inputShoot = false;
    //TIME LOCKS
    lockedFor = 0;
    lockTime;

    //
    mesh;
    ammoLevel;
    scene;
    
    constructor(scene) {
        this.scene = scene;
        this.ammoLevel = weaponStats.ammo;

        this.LoadMesh(scene);
        this.addCrosshair(scene);
        this.InputManager(scene);
        
    }

    InputManager(scene) {
       
        //manage mouse input
        scene.onPointerDown = (evt) => {
            engine.enterPointerlock();   
            if(evt.button === 0)  {
                this.inputShoot = true;
                
            }
                
            
        }  

        scene.onPointerUp = (evt) => { 
            if(evt.button === 0)  {
                this.inputShoot = false;
            }
                
            
        }  

        scene.onKeyboardObservable.add((kbInfo) => { 
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    if(kbInfo.event.key == 'r')
                        this.ChangeStatus(status.RELOADING);
                    if(kbInfo.event.key == 'l')
                        console.log(this.getUserposition());
                    if(kbInfo.event.key == 'q')
                        console.log(this.animate());
            }

          });

    }


    update() {
        ///CHECK IF CAN SHOOT
       if(this.inputShoot && !this.locked) {
            this.ChangeStatus(status.SHOOTING);
           
       }
            
        ammo.innerHTML = "ammo: " + this.ammoLevel + "/"+ weaponStats.ammo;
    }
    ///=====================================================================================///
    ///===================================ACTION METHODS====================================///
    ///=====================================================================================///
    ChangeStatus(newState) {
        if(!this.legal(newState)){
           return;
        } 
        if(this.locked) {
           
            return;
        } 
        
        this.locked = true;
        switch (newState) {
            case status.RELOADING:
                
                this.reload()
                break;

            case status.IDLE:
                
                break;

            case status.SHOOTING:
                this.shoot();
                break;
            default:
                
                break;
        }

        this.status = newState;
    }

    legal(newState) {
        switch (newState) {
            case status.RELOADING:
                if(this.ammoLevel == 30)
                    return false;
                break;

            case status.SHOOTING:
                if(this.ammoLevel <= 0 )
                    return false;
                if(this.status == status.RELOADING)
                    return false;
                break;
        }
        return true;
    }

    shoot() {
        console.log("shot");
        this.ammoLevel--;
        this._fire.play(this._fire.loopAnimation)
        this._fire.onAnimationEndObservable.addOnce(()  => this.toggleState());
        this.pew();
    }

    pew() {
        var ray = camera.getForwardRay(999);
        var hit = this.scene.pickWithRay(ray);

        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.scene);

        // if (hit.pickedMesh == target){
        //    health -= 0.1;
	    // } else if (hit.pickedMesh == ground0) {
        //     camera.position = hit.pickedPoint;
        //     camera.position.y += 5;
        // } else {
        //     //camera.position = ray.origin.clone().add(ray.direction.scale(100));
        // }

        if(hit.pickedMesh && hit.pickedMesh.name == "enemy")
            console.log("hit an enemy!!!");
    }

    reload() {
        console.log("reload");
        
        //this._reload.play(this._reload.loopAnimation)
        //this._reload.onAnimationEndObservable.addOnce(()  => this.endReload());
    }

    endReload() {
        this.ammoLevel = 30;
        this.toggleState();
    }

    toggleState()  {
        this.locked = false;    
        this.status = status.IDLE;
    }
    ///=====================================================================================///
    ///===============================INITIALIZE METHODS====================================///
    ///=====================================================================================///
    async LoadMesh(scene) {

        let res = await BABYLON.SceneLoader.ImportMeshAsync(null, "./Assets/", "fps_pistol_animations.glb", scene)     

        const weapon = res.meshes[0];
        //weapon.scaling = new BABYLON.Vector3(1, 1, 1);
        // Parent the dude to the camera so that he'll go along its position
        weapon.parent = camera;
        //weapon.rotation = new BABYLON.Vector3(0,0,0);
        // Position the dude relative to the camera: a little on the front
        // and a little below
        
        weapon.position.z = 0;
        weapon.position.y = -0.2;
        
       
        this.LoadFireAnimation(weapon)
        
        weapon.computeWorldMatrix();
        console.log(res.animationGroups); //ref in LoadFireAnimation
        scene.stopAllAnimations();
        
        weapon.isPickable = false;
        
        weapon.renderingGroupId = 1;

        res.meshes.forEach((m) => m.renderingGroupId = 1);
        
       
        this._idle = res.animationGroups[0];
       
        
        // this._draw = res.animationGroups[0];    

        // this._fire = res.animationGroups[4];
        // this._fire.speedRatio = 5;

        // this._reload = res.animationGroups[2];
        
        //this._idle.play();
        this.mesh = weapon;
    }

    LoadFireAnimation(weapon) {
        //Get all children involved in the animation
        //Qua serve blender insieme al file glb. Su blender bisogna visualizzare l'animazione e cercare
        //i componenti coinvolti. Solitamente sono tanti quindi conviene scegliere solo quelli che hanno
        //un impatto visivo più importante. Dopodiché, cercate nel glb file il nome del componente. La ricerca
        //o vi da un elemento con lo stesso nome se non per qualche numer accodato (PBody -> PBody_058), in questo
        //caso usate quello come nome, o via da due risultati. In questo, prendete quello senza 'end' nel nome
        const PBody = weapon.getChildren(((m) => m.name == "PBody_058"), false);
        const Pmag = weapon.getChildren(((m) => m.name == "Pmag_061"), false);
        const IK_Hand_Cntrl_R = weapon.getChildren(((m) => m.name == "IK_Hand_Cntrl_R_037"), false);
        const UpArm_R = weapon.getChildren(((m) => m.name == "UpArm_R_09"), false);
        const IK_Hand_Cntrl_L = weapon.getChildren(((m) => m.name == "IK_Hand_Cntrl_L_015"), false);
        

        //Lista dei key frame, per la "fire" animation ho riportato solo 5 dei 14 key frames orginali di blender.
        //Per questo step bisogna consultare la console. In load mesh vengono stampati tutti gli animation group.
        //Selezionate l'animazione interessata, raggiungete il componente '_targetedAnimations'. Tra i componenti 
        //dovete selezionare quello interessato ('Pmag' ad esempio, usando il nome di blender) 
        //rispetto al parametro che state animando, se position o quaternions.
        //Per cui, per ogni elemento di '_targetedAnimations' consultate la prima riga per la proprietà animata e
        //la seconda per l'id (per questa siete costretti ad aprire target).
        //una volta trovato l'elemento corretto, sotto animation cercate keys e trovate tutti i keyframes.
        
        //PISTOL MAH
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


        this.scene.stopAllAnimations();

        var group = new BABYLON.AnimationGroup("fire");

        var _anim = new BABYLON.Animation("Pmag_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(Pmag_Frames_position);
        group.addTargetedAnimation(_anim,Pmag);

        _anim = new BABYLON.Animation("PBody_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(PBody_Frames_position);
        group.addTargetedAnimation(_anim,PBody);

        _anim = new BABYLON.Animation("LeftHand_Pos", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_L_position);
        group.addTargetedAnimation(_anim,IK_Hand_Cntrl_L);

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_L_rotation);
        group.addTargetedAnimation(_anim,IK_Hand_Cntrl_L);

        _anim = new BABYLON.Animation("LeftHand_Pos", "rotationQuaternion", 60, BABYLON.Animation.ANIMATIONTYPE_QUATERNION, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_rotation);
        group.addTargetedAnimation(_anim,IK_Hand_Cntrl_R);


        _anim = new BABYLON.Animation("IK_Hand_Cntrl_R", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        _anim.setKeys(IK_Hand_Cntrl_R_position);
        group.addTargetedAnimation(_anim,IK_Hand_Cntrl_R);

        group.play(group.loopAnimation);
        this._fire = group;
    
    }
    getUserposition(){
        var origin = camera.position;

        var _direction = new BABYLON.Vector3(0, -1, 0);
        

        var length = 100;

        var ray = new BABYLON.Ray(origin, _direction, length);
        let rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(this.scene);

        var hit = this.scene.pickWithRay(ray);
        hit.fastCheck = true;

        
        return hit.pickedPoint
 
    }

    addCrosshair(scene){
        var crosshairMat = new BABYLON.StandardMaterial("crosshairMat", scene);
        crosshairMat.diffuseColor = new BABYLON.Color3(0,0,0);
        crosshairMat.renderingGroupId = 1;
        this.crosshairTop =
            BABYLON.MeshBuilder.CreateBox("crosshairTop", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairTop.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairTop.position.z += 20;
        this.crosshairTop.position.y += 10.3;
        this.crosshairTop.position.x -= 0;
        this.crosshairTop.isPickable = false;
        this.crosshairTop.parent = camera;
        this.crosshairTop.material = crosshairMat;
        this.crosshairTop.renderingGroupId = 1;

        this.crosshairBottom =
            BABYLON.MeshBuilder.CreateBox("crosshairBottom", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairBottom.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairBottom.position.z += 20;
        this.crosshairBottom.position.y += 9.7;
        this.crosshairBottom.position.x -= 0;
        this.crosshairBottom.isPickable = false;
        this.crosshairBottom.parent = camera;
        this.crosshairBottom.material = crosshairMat;
        this.crosshairBottom.renderingGroupId = 1;

        this.crosshairRight =
            BABYLON.MeshBuilder.CreateBox("crosshairRight", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairRight.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairRight.position.z += 20;
        this.crosshairRight.position.y += 10;
        this.crosshairRight.position.x += .3;
        this.crosshairRight.rotation.z = Math.PI / 2;
        this.crosshairRight.isPickable = false;
        this.crosshairRight.parent = camera;
        this.crosshairRight.material = crosshairMat;
        this.crosshairRight.renderingGroupId = 1;

        this.crosshairLeft =
            BABYLON.MeshBuilder.CreateBox("crosshairLeft", { height: .4, width: .04, depth: .04 }, scene);
        this.crosshairLeft.position = new BABYLON.Vector3(0, -10, 0);
        this.crosshairLeft.position.z += 20;
        this.crosshairLeft.position.y += 10;
        this.crosshairLeft.position.x -= .3;
        this.crosshairLeft.rotation.z -= Math.PI / 2;
        this.crosshairLeft.isPickable = false;
        this.crosshairLeft.parent = camera;
        this.crosshairLeft.material = crosshairMat;
        this.crosshairLeft.renderingGroupId = 1;
        
    }


    animate() {
        var shoot = [{
            frame: 0,
            value: this.getPosition(this.mesh.position)
        }];

        shoot.push = [{
            frame: 0,
            value: this.getPosition(this.mesh.position)
        }]
        scene.beginAnimation(this.mesh, 0, 100);
    }

}

const weaponStats = {
    fireRate : 11, //shoot frequency
    ammo: 30
}

const status = {
    RELOADING : 0,
    SHOOTING: 1,
    IDLE : 2,
}