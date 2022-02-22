import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
camera.position.set(10, 10, 10);
renderer.render(scene, camera);

const geometry = new THREE.BoxGeometry(100, 100, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);
torus.position.set(-2600, 200, 8600);
//scene.add(torus);

const shadowLight = new THREE.DirectionalLight(0xffe0b3, 1, 100);
shadowLight.position.set(20000, 20000, 20000);
shadowLight.castShadow = true;


const ambientLight = new THREE.AmbientLight(0xffcda3);
scene.add(shadowLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(shadowLight);
const gridHelper = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper);

const controls = new OrbitControls(camera, renderer.domElement);

const spaceTexture = new THREE.TextureLoader().load('resources/landscapes/sky.jpeg');
scene.background = spaceTexture;

const dromeLoader = new GLTFLoader();
dromeLoader.load(
	'resources/models/drome/hippodrome.gltf',
	function (hippodrome) {
    	hippodrome.scene.castShadow = true;
    	hippodrome.scene.receiveShadow = true;
		hippodrome.scene.scale.multiplyScalar(0.02);
		scene.add(hippodrome.scene);
	},
  
  function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},

	function ( error ) {
		console.log( 'An error happened' );
	}
);

const horseLoader = new GLTFLoader();
horseLoader.load(
	'resources/models/horse/horse.gltf',
	function ( horse ) {
		horse.scene.castShadow = true;
		horse.scene.receiveShadow = true;
		horse.scene.position.y = 3.3; 
		scene.add(horse.scene);

		function animateHorse() {
			requestAnimationFrame(animateHorse);
		  

			horse.scene.position.x += 0.01;
			horse.scene.position.z += 0.01;
		  }
		  
		  animateHorse();
	},
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( 'An error happened' );
	}
);


// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();