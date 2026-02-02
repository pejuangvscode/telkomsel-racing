/**
 * TELKOMSEL FLEETSIGHT RACING 3D
 * Asphalt 8 Style Game Engine
 * Three.js Based Premium Racing Game
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    maxSpeed: 300,
    acceleration: 0.4,
    deceleration: 0.25,
    braking: 0.6,
    turnSpeed: 0.06,
    nitroBoost: 1.5,
    nitroDrain: 0.5,
    nitroRegen: 0.15,
    roadWidth: 14,
    laneWidth: 4,
    cameraHeight: 6,
    cameraDistance: 12,
    drawDistance: 500
};

// ═══════════════════════════════════════════════════════════════════
// SOUND SYSTEM
// ═══════════════════════════════════════════════════════════════════

class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.engineOscillator = null;
        this.engineGain = null;
        this.isEngineRunning = false;
        this.initialized = false;
        this.isMuted = false;
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
        }
        return this.isMuted;
    }
    
    // Engine sound - continuous drone that changes pitch with speed
    startEngine() {
        if (!this.initialized || this.isEngineRunning) return;
        
        this.engineOscillator = this.audioContext.createOscillator();
        this.engineGain = this.audioContext.createGain();
        
        // Create a more complex engine sound
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = 50;
        this.engineGain.gain.value = 0;
        
        // Add some distortion for engine rumble
        const distortion = this.audioContext.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(20);
        
        // Low pass filter for muffled sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        
        this.engineOscillator.connect(distortion);
        distortion.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        
        this.engineOscillator.start();
        this.isEngineRunning = true;
    }
    
    updateEngine(speed, isAccelerating) {
        if (!this.isEngineRunning || !this.engineOscillator) return;
        
        // Pitch increases with speed (50Hz to 150Hz)
        const basePitch = 50 + (speed / CONFIG.maxSpeed) * 100;
        this.engineOscillator.frequency.setTargetAtTime(basePitch, this.audioContext.currentTime, 0.1);
        
        // Volume based on acceleration
        const targetVolume = isAccelerating ? 0.15 + (speed / CONFIG.maxSpeed) * 0.15 : 0.05;
        this.engineGain.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);
    }
    
    stopEngine() {
        if (this.engineOscillator) {
            this.engineGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            setTimeout(() => {
                if (this.engineOscillator) {
                    this.engineOscillator.stop();
                    this.engineOscillator = null;
                }
            }, 200);
        }
        this.isEngineRunning = false;
    }
    
    // Brake screech sound
    playBrake() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // High pitched screech
        osc.type = 'sawtooth';
        osc.frequency.value = 800;
        
        filter.type = 'highpass';
        filter.frequency.value = 600;
        filter.Q.value = 10;
        
        gain.gain.value = 0.08;
        gain.gain.exponentialDecayTo = 0.01;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        
        // Decay
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.1);
        osc.frequency.setTargetAtTime(400, this.audioContext.currentTime, 0.3);
        
        setTimeout(() => osc.stop(), 500);
    }
    
    // Nitro boost whoosh
    playNitro() {
        if (!this.initialized) return;
        
        const noise = this.createNoise(0.5);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        
        gain.gain.value = 0.2;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        // Sweep the filter up
        filter.frequency.setTargetAtTime(3000, this.audioContext.currentTime, 0.2);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.3, 0.2);
    }
    
    // Collision crash sound
    playCrash() {
        if (!this.initialized) return;
        
        // Impact thud
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 100;
        gain.gain.value = 0.4;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.frequency.setTargetAtTime(30, this.audioContext.currentTime, 0.1);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.2);
        
        setTimeout(() => osc.stop(), 500);
        
        // Noise burst
        const noise = this.createNoise(0.3);
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.value = 0.3;
        noiseGain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.15);
        
        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);
    }
    
    // Countdown beep
    playBeep(high = false) {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = high ? 880 : 440;
        gain.gain.value = 0.2;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.05);
        
        setTimeout(() => osc.stop(), 200);
    }
    
    // Score/pass sound
    playScore() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 523.25; // C5
        gain.gain.value = 0.1;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        
        // Quick chirp up
        osc.frequency.setTargetAtTime(659.25, this.audioContext.currentTime + 0.05, 0.02); // E5
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.05);
        
        setTimeout(() => osc.stop(), 150);
    }
    
    // Helper: Create white noise
    createNoise(duration) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.start();
        
        return source;
    }
    
    // Helper: Create distortion curve
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
}

const soundEngine = new SoundEngine();

// ═══════════════════════════════════════════════════════════════════
// GAME STATE
// ═══════════════════════════════════════════════════════════════════

let scene, camera, renderer, clock;
let playerTruck, road, obstacles = [], scenery = [];
let gameState = 'loading';
let isPaused = false;

let player = {
    x: 0,
    speed: 0,
    nitro: 100,
    isNitro: false
};

let stats = {
    score: 0,
    distance: 0,
    maxSpeed: 0,
    bestScore: parseInt(localStorage.getItem('fleetRacingBest') || '0')
};

let input = {
    left: false,
    right: false,
    up: false,
    down: false,
    nitro: false
};

let soundState = {
    isBraking: false,
    wasNitro: false
};

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

function init() {
    clock = new THREE.Clock();
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 100, CONFIG.drawDistance);
    
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, CONFIG.cameraHeight, -CONFIG.cameraDistance);
    camera.lookAt(0, 2, 20);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('gameContainer').appendChild(renderer.domElement);
    
    // Lights
    setupLights();
    
    // Create World
    createSky();
    createGround();
    createRoad();
    createScenery();
    createPlayerTruck();
    
    // Events
    setupEvents();
    
    // Start loading
    simulateLoading();
}

function setupLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    
    // Sun
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(100, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 500;
    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;
    scene.add(sun);
}

function simulateLoading() {
    let progress = 0;
    const progressBar = document.getElementById('loaderProgress');
    const percentText = document.getElementById('loaderPercent');
    
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('menuScreen').classList.remove('hidden');
                document.getElementById('menuBestScore').textContent = stats.bestScore.toLocaleString();
                gameState = 'menu';
            }, 500);
        }
        progressBar.style.width = progress + '%';
        percentText.textContent = Math.floor(progress) + '%';
    }, 100);
}

// ═══════════════════════════════════════════════════════════════════
// WORLD CREATION
// ═══════════════════════════════════════════════════════════════════

function createSky() {
    // Sun sphere
    const sunGeo = new THREE.SphereGeometry(15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(150, 100, 300);
    scene.add(sun);
    
    // Clouds
    for (let i = 0; i < 30; i++) {
        createCloud(
            Math.random() * 600 - 300,
            60 + Math.random() * 40,
            Math.random() * 500
        );
    }
}

function createCloud(x, y, z) {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
        const size = 4 + Math.random() * 6;
        const geo = new THREE.SphereGeometry(size, 8, 8);
        const mesh = new THREE.Mesh(geo, cloudMat);
        mesh.position.set(
            Math.random() * 15 - 7.5,
            Math.random() * 4 - 2,
            Math.random() * 15 - 7.5
        );
        group.add(mesh);
    }
    
    group.position.set(x, y, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'cloud', offset: x });
}

function createGround() {
    // Grass
    const grassGeo = new THREE.PlaneGeometry(800, 2000);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x3A8C3A });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.1, 500);
    grass.receiveShadow = true;
    scene.add(grass);
}

function createRoad() {
    // Main road
    const roadGeo = new THREE.PlaneGeometry(CONFIG.roadWidth, 2000);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, 500);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
    road = roadMesh;
    
    // Road markings
    for (let z = 0; z < 2000; z += 15) {
        // Center dashed line
        if (z % 30 < 15) {
            createRoadMarking(0, z, 0.15, 10);
        }
        // Left lane
        createRoadMarking(-CONFIG.laneWidth, z, 0.1, 8);
        // Right lane
        createRoadMarking(CONFIG.laneWidth, z, 0.1, 8);
    }
    
    // Road barriers
    for (let z = 0; z < 2000; z += 4) {
        createBarrier(-CONFIG.roadWidth/2 - 0.5, z);
        createBarrier(CONFIG.roadWidth/2 + 0.5, z);
    }
}

function createRoadMarking(x, z, width, length) {
    const geo = new THREE.PlaneGeometry(width, length);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.01, z);
    scene.add(mesh);
    scenery.push({ mesh, type: 'marking', z: z });
}

function createBarrier(x, z) {
    const group = new THREE.Group();
    
    // Red part
    const redGeo = new THREE.BoxGeometry(0.6, 0.6, 3);
    const redMat = new THREE.MeshLambertMaterial({ color: 0xE60012 });
    const red = new THREE.Mesh(redGeo, redMat);
    red.position.y = 0.3;
    group.add(red);
    
    // White part
    const whiteGeo = new THREE.BoxGeometry(0.6, 0.4, 3);
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const white = new THREE.Mesh(whiteGeo, whiteMat);
    white.position.y = 0.8;
    group.add(white);
    
    group.position.set(x, 0, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'barrier', z: z });
}

function createScenery() {
    // Trees
    for (let i = 0; i < 150; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (CONFIG.roadWidth/2 + 8 + Math.random() * 30);
        const z = i * 12 + Math.random() * 5;
        createTree(x, z);
    }
    
    // Mountains
    for (let i = 0; i < 15; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        createMountain(
            side * (100 + Math.random() * 80),
            100 + i * 100 + Math.random() * 50
        );
    }
    
    // Buildings (occasional)
    for (let i = 0; i < 20; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (CONFIG.roadWidth/2 + 30 + Math.random() * 40);
        const z = i * 90 + 50 + Math.random() * 30;
        createBuilding(x, z);
    }
}

function createTree(x, z) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 3, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Foliage
    const foliageGeo = new THREE.ConeGeometry(2.5, 5, 8);
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 5;
    foliage.castShadow = true;
    group.add(foliage);
    
    group.position.set(x, 0, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'tree', z: z });
}

function createMountain(x, z) {
    const height = 50 + Math.random() * 50;
    const width = 60 + Math.random() * 40;
    
    const geo = new THREE.ConeGeometry(width, height, 6);
    const mat = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.3, 0.2, 0.3 + Math.random() * 0.15)
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2 - 10, z);
    mesh.rotation.y = Math.random() * Math.PI;
    scene.add(mesh);
    scenery.push({ mesh, type: 'mountain', z: z });
}

function createBuilding(x, z) {
    const height = 10 + Math.random() * 25;
    const width = 8 + Math.random() * 10;
    const depth = 8 + Math.random() * 10;
    
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.3)
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2, z);
    mesh.castShadow = true;
    scene.add(mesh);
    scenery.push({ mesh, type: 'building', z: z });
}

// ═══════════════════════════════════════════════════════════════════
// PLAYER TRUCK
// ═══════════════════════════════════════════════════════════════════

function createPlayerTruck() {
    playerTruck = new THREE.Group();
    
    // Container (Telkomsel Red)
    const containerGeo = new THREE.BoxGeometry(2.8, 2.8, 6);
    const containerMat = new THREE.MeshLambertMaterial({ color: 0xE60012 });
    const container = new THREE.Mesh(containerGeo, containerMat);
    container.position.set(0, 2, -1);
    container.castShadow = true;
    playerTruck.add(container);
    
    // White stripe
    const stripeGeo = new THREE.BoxGeometry(2.9, 0.4, 6.1);
    const stripeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 2.5, -1);
    playerTruck.add(stripe);
    
    // Cabin
    const cabinGeo = new THREE.BoxGeometry(2.6, 2.2, 2.2);
    const cabinMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.7, 2.8);
    cabin.castShadow = true;
    playerTruck.add(cabin);
    
    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(2.2, 1.2, 0.1);
    const windshieldMat = new THREE.MeshLambertMaterial({ color: 0x60A5FA, transparent: true, opacity: 0.8 });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0, 2.3, 3.9);
    playerTruck.add(windshield);
    
    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.5, 0.4, 0.1);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFF88 });
    const hlL = new THREE.Mesh(hlGeo, hlMat);
    hlL.position.set(-0.9, 1.2, 3.95);
    playerTruck.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, hlMat);
    hlR.position.set(0.9, 1.2, 3.95);
    playerTruck.add(hlR);
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const wheelPositions = [
        [-1.3, 0.6, 2.5], [1.3, 0.6, 2.5],
        [-1.3, 0.6, 0], [1.3, 0.6, 0],
        [-1.3, 0.6, -2.5], [1.3, 0.6, -2.5]
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;
        playerTruck.add(wheel);
    });
    
    // Telkomsel Logo on sides
    const logoCanvas = createLogoCanvas();
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoGeo = new THREE.PlaneGeometry(2, 2);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
    
    const logoL = new THREE.Mesh(logoGeo, logoMat);
    logoL.position.set(-1.41, 2, -1);
    logoL.rotation.y = -Math.PI / 2;
    playerTruck.add(logoL);
    
    const logoR = new THREE.Mesh(logoGeo, logoMat);
    logoR.position.set(1.41, 2, -1);
    logoR.rotation.y = Math.PI / 2;
    playerTruck.add(logoR);
    
    playerTruck.position.set(0, 0, 5);
    scene.add(playerTruck);
}

function createLogoCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Circle background
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Red circle
    ctx.fillStyle = '#E60012';
    ctx.beginPath();
    ctx.arc(64, 64, 45, 0, Math.PI * 2);
    ctx.fill();
    
    // T letter
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 55px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', 64, 64);
    
    return canvas;
}

// ═══════════════════════════════════════════════════════════════════
// OBSTACLE VEHICLES
// ═══════════════════════════════════════════════════════════════════

function createObstacle() {
    const types = ['car', 'truck', 'bus'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = [0x3B82F6, 0x10B981, 0xF59E0B, 0x8B5CF6, 0xEF4444, 0x06B6D4, 0xffffff];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const vehicle = new THREE.Group();
    
    if (type === 'car') {
        const bodyGeo = new THREE.BoxGeometry(2, 1.2, 4.5);
        const bodyMat = new THREE.MeshLambertMaterial({ color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.9;
        body.castShadow = true;
        vehicle.add(body);
        
        const roofGeo = new THREE.BoxGeometry(1.8, 0.9, 2.2);
        const roof = new THREE.Mesh(roofGeo, bodyMat);
        roof.position.set(0, 1.85, -0.3);
        roof.castShadow = true;
        vehicle.add(roof);
        
    } else if (type === 'truck') {
        const containerGeo = new THREE.BoxGeometry(2.4, 2.4, 5);
        const containerMat = new THREE.MeshLambertMaterial({ color });
        const container = new THREE.Mesh(containerGeo, containerMat);
        container.position.set(0, 1.7, -0.5);
        container.castShadow = true;
        vehicle.add(container);
        
        const cabinGeo = new THREE.BoxGeometry(2.2, 2, 1.8);
        const cabinMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.5, 2.5);
        cabin.castShadow = true;
        vehicle.add(cabin);
        
    } else {
        const busGeo = new THREE.BoxGeometry(2.6, 2.8, 8);
        const busMat = new THREE.MeshLambertMaterial({ color });
        const bus = new THREE.Mesh(busGeo, busMat);
        bus.position.set(0, 1.9, 0);
        bus.castShadow = true;
        vehicle.add(bus);
    }
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 12);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    [[-1, 1.8], [-1, -1.8], [1, 1.8], [1, -1.8]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.45, z);
        vehicle.add(wheel);
    });
    
    // Random lane
    const lane = (Math.floor(Math.random() * 3) - 1) * CONFIG.laneWidth;
    vehicle.position.set(lane, 0, 250 + Math.random() * 100);
    
    vehicle.userData = {
        type,
        speed: 40 + Math.random() * 80,
        lane
    };
    
    scene.add(vehicle);
    obstacles.push(vehicle);
}

// ═══════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════

function setupEvents() {
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') input.left = true;
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') input.right = true;
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') input.up = true;
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') input.down = true;
        if (e.key === ' ') { e.preventDefault(); input.nitro = true; }
        if (e.key === 'Escape' || e.key.toLowerCase() === 'p') togglePause();
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') input.left = false;
        if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') input.right = false;
        if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') input.up = false;
        if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') input.down = false;
        if (e.key === ' ') input.nitro = false;
    });
    
    // Mobile controls
    setupMobileControls();
    
    // Buttons
    document.getElementById('playButton').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('quitBtn').addEventListener('click', quitToMenu);
    document.getElementById('retryBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', quitToMenu);
    
    // Sound toggle
    document.getElementById('soundBtn').addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        document.getElementById('soundBtn').textContent = isMuted ? '🔇' : '🔊';
        document.getElementById('soundBtn').classList.toggle('muted', isMuted);
    });
    
    // Initialize audio on first click (browser requirement)
    document.addEventListener('click', () => {
        soundEngine.init();
        soundEngine.resume();
    }, { once: true });
    
    // Resize
    window.addEventListener('resize', onResize);
}

function setupMobileControls() {
    const mLeft = document.getElementById('mLeft');
    const mRight = document.getElementById('mRight');
    const mNitro = document.getElementById('mNitro');
    
    // Touch events
    mLeft.addEventListener('touchstart', (e) => { e.preventDefault(); input.left = true; input.up = true; });
    mLeft.addEventListener('touchend', () => { input.left = false; });
    
    mRight.addEventListener('touchstart', (e) => { e.preventDefault(); input.right = true; input.up = true; });
    mRight.addEventListener('touchend', () => { input.right = false; });
    
    mNitro.addEventListener('touchstart', (e) => { e.preventDefault(); input.nitro = true; input.up = true; });
    mNitro.addEventListener('touchend', () => { input.nitro = false; });
    
    // Auto accelerate on mobile touch
    document.addEventListener('touchstart', () => {
        if (gameState === 'playing') input.up = true;
    });
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ═══════════════════════════════════════════════════════════════════
// GAME LOOP
// ═══════════════════════════════════════════════════════════════════

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (gameState === 'playing' && !isPaused) {
        update(delta);
    }
    
    renderer.render(scene, camera);
}

function update(dt) {
    // Speed control
    let targetSpeed = 0;
    let isAccelerating = false;
    
    if (input.up) {
        targetSpeed = CONFIG.maxSpeed;
        isAccelerating = true;
        if (input.nitro && player.nitro > 0) {
            targetSpeed *= CONFIG.nitroBoost;
            player.nitro = Math.max(0, player.nitro - CONFIG.nitroDrain * dt * 60);
            player.isNitro = true;
            
            // Play nitro sound once when activating
            if (!soundState.wasNitro) {
                soundEngine.playNitro();
                soundState.wasNitro = true;
            }
        } else {
            player.isNitro = false;
            soundState.wasNitro = false;
        }
    } else if (input.down) {
        targetSpeed = -20;
        
        // Play brake sound once when starting to brake
        if (!soundState.isBraking && player.speed > 50) {
            soundEngine.playBrake();
            soundState.isBraking = true;
        }
    } else {
        soundState.isBraking = false;
        soundState.wasNitro = false;
    }
    
    // Reset brake state when not braking
    if (!input.down) {
        soundState.isBraking = false;
    }
    
    // Nitro regen
    if (!input.nitro && player.nitro < 100) {
        player.nitro = Math.min(100, player.nitro + CONFIG.nitroRegen * dt * 60);
    }
    
    // Apply acceleration
    if (player.speed < targetSpeed) {
        player.speed += CONFIG.acceleration * dt * 60;
    } else {
        player.speed -= CONFIG.deceleration * dt * 60;
    }
    player.speed = Math.max(0, player.speed);
    
    // Update engine sound
    soundEngine.updateEngine(player.speed, isAccelerating);
    
    // Track max speed
    if (player.speed > stats.maxSpeed) stats.maxSpeed = player.speed;
    
    // Steering (fixed direction)
    const turnAmount = CONFIG.turnSpeed * (player.speed / 100) * dt * 60;
    if (input.left) player.x += turnAmount;  // Left key = move left (positive X)
    if (input.right) player.x -= turnAmount; // Right key = move right (negative X)
    player.x = Math.max(-CONFIG.roadWidth/2 + 2, Math.min(CONFIG.roadWidth/2 - 2, player.x));
    
    // Update player truck
    playerTruck.position.x = player.x;
    playerTruck.rotation.y = (input.left ? -0.1 : input.right ? 0.1 : 0) * (player.speed / CONFIG.maxSpeed);
    playerTruck.rotation.z = (input.left ? -0.03 : input.right ? 0.03 : 0);
    
    // Move world
    const moveAmount = player.speed * dt * 0.15;
    
    // Move scenery
    scenery.forEach(item => {
        item.mesh.position.z -= moveAmount;
        
        // Wrap around
        if (item.mesh.position.z < -50) {
            item.mesh.position.z += 2000;
            if (item.type === 'tree' || item.type === 'building') {
                const side = Math.random() > 0.5 ? 1 : -1;
                item.mesh.position.x = side * (CONFIG.roadWidth/2 + 8 + Math.random() * 50);
            }
        }
    });
    
    // Move obstacles
    obstacles.forEach((obs, i) => {
        obs.position.z -= moveAmount - obs.userData.speed * dt * 0.08;
        
        // Remove if behind
        if (obs.position.z < -30) {
            scene.remove(obs);
            obstacles.splice(i, 1);
            stats.score += 100;
            soundEngine.playScore(); // Play score sound
        }
        
        // Collision check
        const dx = Math.abs(playerTruck.position.x - obs.position.x);
        const dz = Math.abs(playerTruck.position.z - obs.position.z);
        
        if (dx < 2.2 && dz < 4) {
            gameOver();
        }
    });
    
    // Spawn obstacles
    if (Math.random() < 0.015 && obstacles.length < 12) {
        createObstacle();
    }
    
    // Update stats
    stats.distance += player.speed * dt * 0.001;
    stats.score += Math.floor(player.speed * dt * 0.1);
    
    // Update HUD
    updateHUD();
    
    // Visual effects
    updateEffects();
}

function updateHUD() {
    document.getElementById('hudScore').textContent = Math.floor(stats.score).toLocaleString();
    document.getElementById('hudDist').textContent = stats.distance.toFixed(1);
    document.getElementById('hudSpeedNum').textContent = Math.floor(player.speed);
    document.getElementById('speedoValue').textContent = Math.floor(player.speed);
    document.getElementById('speedoMax').textContent = Math.floor(stats.maxSpeed);
    
    // Nitro bar
    document.getElementById('nitroFill').style.width = player.nitro + '%';
    
    // Speedometer progress
    const speedPercent = player.speed / (CONFIG.maxSpeed * CONFIG.nitroBoost);
    const dashOffset = 565 - (565 * Math.min(speedPercent, 1) * 0.75);
    document.getElementById('speedoProgress').style.strokeDashoffset = dashOffset;
}

function updateEffects() {
    // Speed lines
    const speedLines = document.getElementById('speedLines');
    if (player.speed > 150) {
        speedLines.classList.add('active');
    } else {
        speedLines.classList.remove('active');
    }
    
    // Boost overlay
    const boostOverlay = document.getElementById('boostOverlay');
    if (player.isNitro) {
        boostOverlay.classList.add('active');
    } else {
        boostOverlay.classList.remove('active');
    }
}

// ═══════════════════════════════════════════════════════════════════
// GAME STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function startGame() {
    // Initialize sound
    soundEngine.init();
    soundEngine.resume();
    
    // Reset
    player.x = 0;
    player.speed = 0;
    player.nitro = 100;
    player.isNitro = false;
    stats.score = 0;
    stats.distance = 0;
    stats.maxSpeed = 0;
    
    // Reset sound state
    soundState.isBraking = false;
    soundState.wasNitro = false;
    
    // Clear obstacles
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    
    // Reset truck
    playerTruck.position.set(0, 0, 5);
    playerTruck.rotation.set(0, 0, 0);
    
    // Hide menu, show game
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    // Countdown
    startCountdown();
}

function startCountdown() {
    const overlay = document.getElementById('countdownOverlay');
    const numEl = document.getElementById('countdownNum');
    
    overlay.classList.remove('hidden');
    let count = 3;
    numEl.textContent = count;
    soundEngine.playBeep(false); // First beep
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.textContent = count;
            soundEngine.playBeep(false); // Countdown beep
        } else if (count === 0) {
            numEl.textContent = 'GO!';
            numEl.style.color = '#00FF88';
            soundEngine.playBeep(true); // High beep for GO!
        } else {
            clearInterval(interval);
            overlay.classList.add('hidden');
            numEl.style.color = '';
            
            // Start game
            gameState = 'playing';
            document.getElementById('gameHUD').classList.remove('hidden');
            
            // Start engine sound
            soundEngine.startEngine();
            
            // Spawn initial obstacles
            for (let i = 0; i < 5; i++) {
                createObstacle();
            }
        }
    }, 1000);
}

function gameOver() {
    gameState = 'gameover';
    
    // Play crash sound and stop engine
    soundEngine.playCrash();
    soundEngine.stopEngine();
    
    // Update best score
    if (stats.score > stats.bestScore) {
        stats.bestScore = stats.score;
        localStorage.setItem('fleetRacingBest', stats.bestScore.toString());
    }
    
    // Update game over screen
    document.getElementById('goScore').textContent = Math.floor(stats.score).toLocaleString();
    document.getElementById('goDist').textContent = stats.distance.toFixed(1);
    document.getElementById('goSpeed').textContent = Math.floor(stats.maxSpeed);
    
    // Hide HUD, show game over
    document.getElementById('gameHUD').classList.add('hidden');
    document.getElementById('speedLines').classList.remove('active');
    document.getElementById('boostOverlay').classList.remove('active');
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function togglePause() {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    
    if (isPaused) {
        resumeGame();
    } else {
        isPaused = true;
        gameState = 'paused';
        document.getElementById('pScore').textContent = Math.floor(stats.score).toLocaleString();
        document.getElementById('pDist').textContent = stats.distance.toFixed(1);
        document.getElementById('pauseScreen').classList.remove('hidden');
    }
}

function resumeGame() {
    isPaused = false;
    gameState = 'playing';
    document.getElementById('pauseScreen').classList.add('hidden');
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
}

function quitToMenu() {
    gameState = 'menu';
    isPaused = false;
    
    // Stop engine sound
    soundEngine.stopEngine();
    
    // Clear
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    
    // Hide all, show menu
    document.getElementById('gameHUD').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('speedLines').classList.remove('active');
    document.getElementById('boostOverlay').classList.remove('active');
    document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('menuBestScore').textContent = stats.bestScore.toLocaleString();
}

// ═══════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════

init();
animate();
