import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { keys } from './keyboard.js';
import { checkCollision } from './collision.js';

let characterContainer, mixer, characterFBX;
let idleAction, walkAction, runAction, activeAction;

export function loadCharacter(scene, house) {
    const loader = new FBXLoader();
    const path = './examples/models/personaje/';
    characterContainer = new THREE.Group();

    loader.load(path + 'idle.fbx', (fbx) => {
        characterFBX = fbx;
        characterFBX.scale.set(0.2, 0.2, 0.2);
        characterFBX.rotation.y = Math.PI;
        
        characterFBX.traverse(c => {
            if (c.isMesh) {
                c.castShadow = true;
                c.receiveShadow = true;
            }
        });

        characterContainer.add(characterFBX);

        // =========================
        // 🔥 POSICIÓN EN LADO DERECHO (PUERTA REAL)
        // =========================
        const houseBox = new THREE.Box3().setFromObject(house);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        houseBox.getSize(size);
        houseBox.getCenter(center);

        characterContainer.position.set(
            center.x + size.x / 2 + 120, // 🔥 lado derecho (X+)
            0,
            center.z // centrado en Z
        );

        scene.add(characterContainer);

        mixer = new THREE.AnimationMixer(characterFBX);
        idleAction = mixer.clipAction(fbx.animations[0]);
        idleAction.play();
        activeAction = idleAction;

        loader.load(path + 'Injured Walking.fbx', a => {
            if (a.animations.length > 0)
                walkAction = mixer.clipAction(a.animations[0]);
        });

        loader.load(path + 'Slow Run.fbx', a => {
            if (a.animations.length > 0)
                runAction = mixer.clipAction(a.animations[0]);
        });
    });
}

function switchAnimation(newAction) {
    if (!newAction || activeAction === newAction) return;
    activeAction.fadeOut(0.3);
    newAction.reset().fadeIn(0.3).play();
    activeAction = newAction;
}

export function updateCharacter(delta) {
    if (!characterContainer) return;

    const prevPos = characterContainer.position.clone();
    if (mixer) mixer.update(delta);

    let moving = false;
    let speed = keys.shift ? 4.0 : 1.5;

    if (keys.w) { characterContainer.translateZ(-speed * delta * 50); moving = true; }
    if (keys.s) { characterContainer.translateZ(speed * delta * 50); moving = true; }
    if (keys.a) characterContainer.rotation.y += 0.05;
    if (keys.d) characterContainer.rotation.y -= 0.05;

    if (checkCollision(characterContainer)) {
        characterContainer.position.copy(prevPos);
    }

    if (moving) {
        switchAnimation(keys.shift ? runAction : walkAction);
    } else {
        switchAnimation(idleAction);
    }
}

export function getCharacter() {
    return characterContainer;
}