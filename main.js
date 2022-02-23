import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const modelLoader = new GLTFLoader();
const hippodromeLoader = modelLoader.loadAsync('resources/models/drome/hippodrome.gltf');
const horseLoader = modelLoader.loadAsync('resources/models/horse/horse.gltf');
Promise.all([hippodromeLoader, horseLoader]).then((models) => {
	onModelsLoaded(
		models[0],
		models[1]
	);
});

function onModelsLoaded(hippodrome, horse) {
	// Fix drome position, rotation and size
	hippodrome.scene.rotateY(Math.PI / 10);
	hippodrome.scene.position.x -= 3.75;
	hippodrome.scene.scale.multiplyScalar(0.015);

	// Fix horse position, rotation and size
	horse.scene.position.y = 2.6;
	horse.scene.rotateY(-Math.PI / 4);
	horse.scene.position.z = -140;
	horse.scene.position.x -= 20;

	const horseScenes = [];
	horseScenes.push(horse.scene);

	for(var index = 1; index < 6; index++) {
		const clonedScene = horse.scene.clone();
		clonedScene.position.x += 8 * index;
		horseScenes.push(clonedScene);
	}
}

function onModelsReady(hippodrome, horseScenes) {
	// Setup
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#bg'),
	});

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	camera.position.set(10, 10, 10);
	renderer.render(scene, camera);

	const shadowLight = new THREE.DirectionalLight(0xffe0b3, 1);
	shadowLight.position.set(0, 25, 0);
	shadowLight.castShadow = true;

	const ambientLight = new THREE.AmbientLight(0xffcda3, 0.3);
	scene.add(shadowLight, ambientLight);

	const controls = new OrbitControls(camera, renderer.domElement);

	const spaceTexture = new THREE.TextureLoader().load('resources/landscapes/sky.jpeg');
	scene.background = spaceTexture;

	hippodrome.scene.castShadow = true;
	hippodrome.scene.receiveShadow = true;
	scene.add(hippodrome.scene);

	for(var index = 0; index < 6; index++) {
		const horseScene = horseScenes[index];
		horseScene.castShadow = true;
		horseScene.receiveShadow = true;
		scene.add(horseScene);
	}

	// Animation Loop
	function animate() {
		requestAnimationFrame(animate);

		for(var index = 0; index < 6; index++) {
			const horseScene = horseScenes[index];
			const randomFactor = getRandomInt(20, 40);
			horseScene.position.z += 0.15 + 0.01 * randomFactor;
			scene.add(horseScene);
		}

		controls.update();
		renderer.render(scene, camera);
	}

	animate();
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}
