import * as THREE from 'three';
import { BunkerEngine } from './engine.js';

// --- Global Core Memory Context States ---
const state = {
    health: 100,
    score: 0,
    scrap: 5,
    inventory: { door: 0, hatch: 0, ladder: 0, scaffold: 0 },
    craftingCosts: { door: 3, hatch: 2, ladder: 1, scaffold: 2 }
};

// Initialize the 3D System Layout Class context
const engine = new BunkerEngine('canvas-container');

setupUIInputListeners();
syncDomInterface();
runLoop();

function runLoop(timestamp) {
    requestAnimationFrame(runLoop);
    engine.updateAnimationLoop(timestamp);
}

function setupUIInputListeners() {
    // Buttons Inputs Actions Triggers
    document.getElementById('btn-jump').addEventListener('click', () => {
        engine.camera.position.y += 0.4; // Trigger Jump vector impulse elevation movement
        state.score += 10;
        syncDomInterface();
    });

    document.getElementById('btn-fire').addEventListener('click', () => {
        engine.triggerWeaponFlash();
        state.score += 25;
        syncDomInterface();
    });

    document.getElementById('btn-radiation').addEventListener('click', () => {
        state.health = Math.max(0, state.health - 20);
        syncDomInterface();
        if (state.health <= 0) document.getElementById('game-over-screen').classList.add('active');
    });

    document.getElementById('btn-respawn').addEventListener('click', () => {
        state.health = 100;
        state.scrap = 5;
        state.score = 0;
        Object.keys(state.inventory).forEach(k => state.inventory[k] = 0);
        document.getElementById('game-over-screen').classList.remove('active');
        syncDomInterface();
    });

    // 3D Scene Interactive Item Selection Raycaster Logic Tracking
    const raycaster = new THREE.Raycaster();
    const cursor = new THREE.Vector2();

    window.addEventListener('click', (e) => {
        if (state.health <= 0) return;

        cursor.x = (e.clientX / window.innerWidth) * 2 - 1;
        cursor.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(cursor, engine.camera);
        const interactions = raycaster.intersectObjects(engine.craftableMeshes);

        if (interactions.length > 0) {
            const hitMesh = interactions[0].object;
            const targetId = hitMesh.userData.id;
            const moduleCost = state.craftingCosts[targetId];

            if (state.scrap >= moduleCost) {
                state.scrap -= moduleCost;
                state.inventory[targetId]++;
                state.score += 100;
                hitMesh.scale.set(1.3, 1.3, 1.3); // Interaction visual pop confirmation response
                syncDomInterface();
            } else {
                const nativeColor = hitMesh.material.color.getHex();
                hitMesh.material.color.setHex(0xff0000); // Denied error flash signal mapping response
                setTimeout(() => hitMesh.material.color.setHex(nativeColor), 200);
            }
        }
    });
}

function syncDomInterface() {
    document.getElementById('health-bar').style.width = `${state.health}%`;
    document.getElementById('score-val').innerText = state.score;
    document.getElementById('scrap-val').innerText = state.scrap;
    document.getElementById('count-door').innerText = state.inventory.door;
    document.getElementById('count-hatch').innerText = state.inventory.hatch;
    document.getElementById('count-ladder').innerText = state.inventory.ladder;
    document.getElementById('count-scaffold').innerText = state.inventory.scaffold;
}
