import * as THREE from 'three'; 
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadHouse(scene, onLoad) {
    const loader = new GLTFLoader();

    loader.load('./examples/models/casa/mansionInterior.glb', function (gltf) {

        const house = gltf.scene;

        house.scale.set(25, 25, 25);
        house.position.set(235, 0, 15);

        house.name = "CASA";

        scene.add(house);

        // 🔥 IMPORTANTE: devolvemos la casa
        if (onLoad) onLoad(house);

        // 🔥 OBJETOS
        loadItem(scene,
            './examples/models/objetos/carta_fbx.glb',
            new THREE.Vector3(-59, 5, -421),
            2,
            "CARTA"
        );

        loadItem(scene,
            './examples/models/objetos/mesa_de_centro.glb',
            new THREE.Vector3(-49, 0, -423),
            0.5,
            "MESA"
        );

        loadItem(scene,
            './examples/models/objetos/llave_antigua__ancient_key.glb',
            new THREE.Vector3(26, 0, -573),
            10,
            "LLAVE"
        );

        loadItem(scene,
            './examples/models/objetos/old_bookcase__miscellaneous.glb',
            new THREE.Vector3(-49, 0, -423),
            2,
            "LIBRERO",
            Math.PI
        );

    }, undefined, (error) => console.error("Error en Mansión:", error));
}

function loadItem(scene, path, worldPosition, scale, name, rotY = 0) {

    const loader = new GLTFLoader();

    loader.load(path, (gltf) => {

        const obj = gltf.scene;

        obj.position.copy(worldPosition);
        obj.scale.set(scale, scale, scale);
        obj.rotation.y = rotY;

        obj.name = name;

        scene.add(obj);

    }, undefined, () => {
        console.error("Error cargando:", path);
    });
}