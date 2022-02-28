import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export async function createAsync() {
    const modelLoader = new GLTFLoader();
    const hippodromeLoader = modelLoader.loadAsync('resources/models/drome/hippodrome.gltf');
    const horseLoader = modelLoader.loadAsync('resources/models/horse/horse.gltf');
    const models = await Promise.all([hippodromeLoader, horseLoader])
    return new RaceGame(models[0], models[1]);
}

export class RaceGame extends THREE.EventDispatcher {

    hippodrome;
    horse;
    horseScenes = [];

    isRacing = false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#bg'),
    });

    // Use dynamic values if possible without hard-code
    endZ = 100;
    horseBaseSpeed = 0.15;
    horseMinSpeedPercent = 0.5;
    horseMaxSpeedPercent = 1.5;

    horseCount = 6;

    constructor(hippodrome, horse) {
        super();
        this.hippodrome = hippodrome;
        this.horse = horse;
        this.prepareModels();
    }

    prepareModels() {
        // Fix drome position, rotation and size
        this.hippodrome.scene.rotateY(Math.PI / 10);
        this.hippodrome.scene.position.x = -3.75;
        this.hippodrome.scene.scale.multiplyScalar(0.015);

        // Fix horse position, rotation and size
        this.horse.scene.position.y = 2.6;
        this.horse.scene.rotateY(-Math.PI / 4);
        this.horse.scene.position.z = -this.endZ;
        this.horse.scene.position.x = -20;

        this.horseScenes.push(this.horse.scene);
        for(var index = 1; index < this.horseCount; index++) {
            const clonedScene = this.horse.scene.clone();
            clonedScene.position.x += 8 * index;
            this.horseScenes.push(clonedScene);
        }
    }

    resetModels() {
        for(var index = 0; index < this.horseCount; index++) {
            const horseScene = this.horseScenes[index];
            horseScene.position.z = -this.endZ;
        }
    }

    renderModels() {
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.set(
            this.horse.scene.position.x - 7,
            this.horse.scene.position.y + 3,
            this.horse.scene.position.z
        );

        this.camera.lookAt(this.horse.scene.position);

        const shadowLight = new THREE.DirectionalLight(0xffe0b3, 1);
        shadowLight.position.set(0, 25, 0);
        shadowLight.castShadow = true;

        const ambientLight = new THREE.AmbientLight(0xffcda3, 0.3);
        this.scene.add(shadowLight, ambientLight);

        const spaceTexture = new THREE.TextureLoader().load('resources/landscapes/sky.jpeg');
        this.scene.background = spaceTexture;

        this.hippodrome.scene.castShadow = true;
        this.hippodrome.scene.receiveShadow = true;
        this.scene.add(this.hippodrome.scene);

        for(var index = 0; index < this.horseCount; index++) {
            const horseScene = this.horseScenes[index];
            horseScene.castShadow = true;
            horseScene.receiveShadow = true;
            this.scene.add(horseScene);
        }

        this.renderer.render(this.scene, this.camera);
        this.dispatchEvent( { type: 'models_rendered' } );
    }

    startRace() {
        this.resetModels();
        this.dispatchEvent( { type: 'race_started' } );
        this.isRacing = true;
    }

    endRace() {
        this.isRacing = false;
        this.resetModels();
        this.dispatchEvent( { type: 'race_ended' } );
    }

    refreshModels() {        
        if(!this.isRacing) return;

        var maxZ = -this.endZ;
        var maxPosition;
        for(var index = 0; index < this.horseCount; index++) {
            const horseScene = this.horseScenes[index];
 
            const randomFactor = this.getRandomFloat(this.horseMinSpeedPercent, this.horseMaxSpeedPercent);
            horseScene.position.z += this.horseBaseSpeed * randomFactor;

            if(horseScene.position.z >= this.endZ) {
                this.dispatchEvent( { type: 'horse_won', message: index } );
                this.endRace();
                break;
            }

            if(horseScene.position.z >= maxZ) {
                maxZ = horseScene.position.z;
                maxPosition = horseScene.position;
            }
        }

                   
        this.camera.position.z = maxPosition.z;       
        this.renderer.render(this.scene, this.camera);
    }

    getRandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
}