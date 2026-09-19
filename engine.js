import * as THREE from 'three';

export class BunkerEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.craftableMeshes = [];
        this.itemCatalog = [
            { id: 'door', color: 0xff3355, type: 'box', size: [0.8, 1.4, 0.15] },
            { id: 'hatch', color: 0x33ccff, type: 'box', size: [1.1, 0.15, 1.1] },
            { id: 'ladder', color: 0xffaa00, type: 'cylinder', size: [0.04, 0.04, 1.5] },
            { id: 'scaffold', color: 0x8888aa, type: 'box', size: [1.2, 1.2, 1.2] }
        ];

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050508, 0.15);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.2, 4);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0x1a2430, 1.5);
        this.scene.add(ambient);

        this.pointLight = new THREE.PointLight(0x00ffaa, 2, 15);
        this.pointLight.position.set(0, 3, 2);
        this.scene.add(this.pointLight);

        // Floor / Grid Layout
        const floorGeo = new THREE.PlaneGeometry(20, 20);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x11151c, roughness: 0.8 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        this.scene.add(floor);

        const grid = new THREE.GridHelper(20, 20, 0x00ffaa, 0x223344);
        grid.position.y = -0.99;
        this.scene.add(grid);

        this.spawnHolograms();
        window.addEventListener('resize', () => this.onWindowResize());
    }

    spawnHolograms() {
        const spacing = 1.6;
        const startX = -((this.itemCatalog.length - 1) * spacing) / 2;

        this.itemCatalog.forEach((item, index) => {
            let geo;
            if (item.type === 'box') geo = new THREE.BoxGeometry(...item.size);
            else if (item.type === 'cylinder') geo = new THREE.CylinderGeometry(item.size[0], item.size[1], item.size[2], 12);

            const mat = new THREE.MeshStandardMaterial({
                color: item.color,
                emissive: item.color,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.85
            });

            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(startX + (index * spacing), 0.3, 0);
            mesh.userData = { id: item.id, initialY: 0.3 };
            
            this.scene.add(mesh);
            this.craftableMeshes.push(mesh);
        });
    }

    triggerWeaponFlash() {
        const flash = new THREE.PointLight(0xff3333, 10, 30);
        flash.position.set(0, 1, 2);
        this.scene.add(flash);
        setTimeout(() => this.scene.remove(flash), 70);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateAnimationLoop(timestamp) {
        if (this.camera.position.y > 1.2) this.camera.position.y -= 0.02;

        const time = timestamp * 0.0015 || 0;
        this.craftableMeshes.forEach((mesh, index) => {
            mesh.position.y = mesh.userData.initialY + Math.sin(time + index) * 0.08;
            mesh.rotation.y += 0.01;

            mesh.scale.x += (1.0 - mesh.scale.x) * 0.1;
            mesh.scale.y += (1.0 - mesh.scale.y) * 0.1;
            mesh.scale.z += (1.0 - mesh.scale.z) * 0.1;
        });

        this.renderer.render(this.scene, this.camera);
    }
}
