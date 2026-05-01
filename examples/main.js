import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { setupLights } from './lights.js';
import { loadHouse } from './house.js';
import { loadCharacter, updateCharacter } from './player.js';
import { setupKeyboard } from './keyboard.js';
import { updateCamera } from './camara.js';
import { setupCollisions } from './collision.js';

export let scene, camera, renderer;
const clock = new THREE.Clock();

init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        3000
    );
    camera.position.set(0, 60, 400);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // =========================
    // 💡 LUCES (SIN CAMBIOS)
    // =========================
    setupLights(scene);

    // =========================
    // 🌙 HDR 4K (SIN CAMBIOS)
    // =========================
    const rgbeLoader = new RGBELoader();

    rgbeLoader.load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rogland_clear_night_4k.hdr',
        (texture) => {

            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();

            const envMap = pmremGenerator.fromEquirectangular(texture).texture;

            scene.environment = envMap;
            scene.background = envMap;

            texture.dispose();
            pmremGenerator.dispose();
        }
    );

    // =========================
    // 🧱 SUELO "NATURAL" (SIN LUZ)
    // =========================
    const textureLoader = new THREE.TextureLoader();

    const floorTexture = textureLoader.load('./examples/textures/suel.png');

    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(40, 40);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(3000, 3000),
        new THREE.MeshBasicMaterial({
            map: floorTexture
        })
    );

    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // =========================
    // 🏠 CASA + COLISIONES + PERSONAJE
    // =========================
    loadHouse(scene, (house) => {
        setupCollisions(scene, house);
        loadCharacter(scene, house);
    });

    // =========================
    // ⌨️ CONTROLES
    // =========================
    setupKeyboard();

    // =========================
    // 🔄 RESPONSIVE
    // =========================
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    updateCharacter(delta);
    updateCamera(camera);

    renderer.render(scene, camera);
}