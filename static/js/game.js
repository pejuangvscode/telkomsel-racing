/**
 * P&T TOWNHALL RACING CHAMPIONSHIP 2026
 * Premium 3D Racing Game for C-Level Presentation
 * Telkomsel Enterprise Solutions
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    maxSpeed: 320,
    acceleration: 0.45,
    deceleration: 0.28,
    braking: 0.7,
    turnSpeed: 0.065,
    nitroBoost: 1.6,
    nitroDrain: 0.6,
    nitroRegen: 0.18,
    roadWidth: 16,
    laneWidth: 4.5,
    cameraHeight: 7,
    cameraDistance: 14,
    drawDistance: 600
};

// API Configuration
const API_URL = window.location.origin;

// ═══════════════════════════════════════════════════════════════════
// SOUND SYSTEM (Enhanced)
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
            this.masterGain.gain.value = 0.25;
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
            this.masterGain.gain.value = this.isMuted ? 0 : 0.25;
        }
        return this.isMuted;
    }
    
    startEngine() {
        if (!this.initialized || this.isEngineRunning) return;
        
        this.engineOscillator = this.audioContext.createOscillator();
        this.engineGain = this.audioContext.createGain();
        
        this.engineOscillator.type = 'sawtooth';
        this.engineOscillator.frequency.value = 45;
        this.engineGain.gain.value = 0;
        
        const distortion = this.audioContext.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(25);
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        
        this.engineOscillator.connect(distortion);
        distortion.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);
        
        this.engineOscillator.start();
        this.isEngineRunning = true;
    }
    
    updateEngine(speed, isAccelerating) {
        if (!this.isEngineRunning || !this.engineOscillator) return;
        
        const basePitch = 45 + (speed / CONFIG.maxSpeed) * 120;
        this.engineOscillator.frequency.setTargetAtTime(basePitch, this.audioContext.currentTime, 0.1);
        
        const targetVolume = isAccelerating ? 0.12 + (speed / CONFIG.maxSpeed) * 0.18 : 0.04;
        this.engineGain.gain.setTargetAtTime(targetVolume, this.audioContext.currentTime, 0.1);
    }
    
    stopEngine() {
        if (this.engineOscillator) {
            this.engineGain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.15);
            setTimeout(() => {
                if (this.engineOscillator) {
                    this.engineOscillator.stop();
                    this.engineOscillator = null;
                }
            }, 250);
        }
        this.isEngineRunning = false;
    }
    
    playBrake() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = 850;
        
        filter.type = 'highpass';
        filter.frequency.value = 650;
        filter.Q.value = 12;
        
        gain.gain.value = 0.06;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.12);
        osc.frequency.setTargetAtTime(450, this.audioContext.currentTime, 0.35);
        
        setTimeout(() => osc.stop(), 600);
    }
    
    playNitro() {
        if (!this.initialized) return;
        
        const noise = this.createNoise(0.6);
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        filter.type = 'bandpass';
        filter.frequency.value = 1200;
        filter.Q.value = 1.2;
        
        gain.gain.value = 0.18;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        filter.frequency.setTargetAtTime(3500, this.audioContext.currentTime, 0.25);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.35, 0.25);
    }
    
    playExplosion() {
        if (!this.initialized) return;
        
        // Multi-layered explosion sound
        // Layer 1: Deep impact
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        osc1.type = 'sine';
        osc1.frequency.value = 80;
        gain1.gain.value = 0.5;
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start();
        osc1.frequency.setTargetAtTime(20, this.audioContext.currentTime, 0.15);
        gain1.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.3);
        setTimeout(() => osc1.stop(), 600);
        
        // Layer 2: Crack/snap
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = 200;
        gain2.gain.value = 0.35;
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start();
        osc2.frequency.setTargetAtTime(50, this.audioContext.currentTime, 0.08);
        gain2.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.2);
        setTimeout(() => osc2.stop(), 400);
        
        // Layer 3: Noise burst
        const noise = this.createNoise(0.5);
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1500;
        noiseGain.gain.value = 0.4;
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseGain.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.25);
        noiseFilter.frequency.setTargetAtTime(300, this.audioContext.currentTime, 0.2);
    }
    
    playBeep(high = false) {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = high ? 880 : 440;
        gain.gain.value = 0.15;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.05);
        
        setTimeout(() => osc.stop(), 200);
    }
    
    playScore() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 523.25;
        gain.gain.value = 0.08;
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        osc.frequency.setTargetAtTime(659.25, this.audioContext.currentTime + 0.05, 0.02);
        gain.gain.setTargetAtTime(0.01, this.audioContext.currentTime + 0.1, 0.05);
        
        setTimeout(() => osc.stop(), 150);
    }
    
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
let playerCar, road, obstacles = [], scenery = [];
let gameState = 'loading';
let isPaused = false;

let playerData = {
    name: '',
    x: 0,
    speed: 0,
    nitro: 100,
    isNitro: false
};

let stats = {
    score: 0,
    distance: 0,
    maxSpeed: 0
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
    scene.fog = new THREE.Fog(0x87CEEB, 150, CONFIG.drawDistance);
    
    // Camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, CONFIG.cameraHeight, -CONFIG.cameraDistance);
    camera.lookAt(0, 2.5, 25);
    
    // Renderer with enhanced settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
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
    createPlayerCar();
    
    // Events
    setupEvents();
    
    // Start loading
    simulateLoading();
}

function setupLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambient);
    
    // Sun (directional light)
    const sun = new THREE.DirectionalLight(0xffffff, 0.85);
    sun.position.set(120, 120, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 600;
    sun.shadow.camera.left = -120;
    sun.shadow.camera.right = 120;
    sun.shadow.camera.top = 120;
    sun.shadow.camera.bottom = -120;
    scene.add(sun);
    
    // Hemispheric light for better outdoor feel
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3A8C3A, 0.3);
    scene.add(hemiLight);
}

function simulateLoading() {
    let progress = 0;
    const progressBar = document.getElementById('loaderProgress');
    const percentText = document.getElementById('loaderPercent');
    
    const statusMessages = [
        'Loading 3D Engine...',
        'Creating Race Track...',
        'Spawning Vehicles...',
        'Initializing Physics...',
        'Preparing Championship...'
    ];
    
    let statusIndex = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 12 + 8;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            progressBar.style.width = '100%';
            percentText.textContent = '100%';
            
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('registrationScreen').classList.remove('hidden');
                gameState = 'registration';
                
                // Load leaderboard in background
                loadLeaderboard();
            }, 700);
        } else {
            if (Math.floor(progress / 20) > statusIndex) {
                statusIndex = Math.floor(progress / 20);
                if (statusIndex < statusMessages.length) {
                    document.querySelector('.loader-status').textContent = statusMessages[statusIndex];
                }
            }
        }
        
        progressBar.style.width = progress + '%';
        percentText.textContent = Math.floor(progress) + '%';
    }, 120);
}

// ═══════════════════════════════════════════════════════════════════
// WORLD CREATION - ENHANCED REALISM
// ═══════════════════════════════════════════════════════════════════

function createSky() {
    // Realistic sun
    const sunGeo = new THREE.SphereGeometry(18, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD33, fog: false });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(180, 120, 350);
    scene.add(sun);
    
    // Clouds with more detail
    for (let i = 0; i < 35; i++) {
        createCloud(
            Math.random() * 700 - 350,
            65 + Math.random() * 45,
            Math.random() * 550 + 50
        );
    }
}

function createCloud(x, y, z) {
    const group = new THREE.Group();
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    
    const count = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
        const size = 5 + Math.random() * 7;
        const geo = new THREE.SphereGeometry(size, 10, 10);
        const mesh = new THREE.Mesh(geo, cloudMat);
        mesh.position.set(
            Math.random() * 18 - 9,
            Math.random() * 5 - 2.5,
            Math.random() * 18 - 9
        );
        group.add(mesh);
    }
    
    group.position.set(x, y, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'cloud', offset: x });
}

function createGround() {
    // Grass terrain
    const grassGeo = new THREE.PlaneGeometry(900, 2500);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0x3A8C3A });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.15, 600);
    grass.receiveShadow = true;
    scene.add(grass);
}

function createRoad() {
    // Main asphalt road
    const roadGeo = new THREE.PlaneGeometry(CONFIG.roadWidth, 2500);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, 600);
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
    road = roadMesh;
    
    // Road markings - white and yellow lines
    for (let z = 0; z < 2500; z += 18) {
        // Center dashed yellow line
        if (z % 36 < 18) {
            createRoadMarking(0, z, 0.2, 12, 0xFFDD00);
        }
        // Left lane white line
        createRoadMarking(-CONFIG.laneWidth, z, 0.12, 10, 0xffffff);
        // Right lane white line
        createRoadMarking(CONFIG.laneWidth, z, 0.12, 10, 0xffffff);
    }
    
    // Road barriers with Telkomsel colors
    for (let z = 0; z < 2500; z += 5) {
        createBarrier(-CONFIG.roadWidth/2 - 0.6, z);
        createBarrier(CONFIG.roadWidth/2 + 0.6, z);
    }
}

function createRoadMarking(x, z, width, length, color) {
    const geo = new THREE.PlaneGeometry(width, length);
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.02, z);
    scene.add(mesh);
    scenery.push({ mesh, type: 'marking', z: z });
}

function createBarrier(x, z) {
    const group = new THREE.Group();
    
    // Telkomsel red section
    const redGeo = new THREE.BoxGeometry(0.7, 0.7, 3.5);
    const redMat = new THREE.MeshLambertMaterial({ color: 0xE60012 });
    const red = new THREE.Mesh(redGeo, redMat);
    red.position.y = 0.35;
    red.castShadow = true;
    group.add(red);
    
    // White reflective section
    const whiteGeo = new THREE.BoxGeometry(0.7, 0.5, 3.5);
    const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const white = new THREE.Mesh(whiteGeo, whiteMat);
    white.position.y = 0.95;
    white.castShadow = true;
    group.add(white);
    
    group.position.set(x, 0, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'barrier', z: z });
}

function createScenery() {
    // Dense tree population
    for (let i = 0; i < 200; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (CONFIG.roadWidth/2 + 10 + Math.random() * 40);
        const z = i * 11 + Math.random() * 8;
        createTree(x, z);
    }
    
    // Mountains for depth
    for (let i = 0; i < 20; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        createMountain(
            side * (120 + Math.random() * 100),
            120 + i * 110 + Math.random() * 60
        );
    }
    
    // Urban buildings
    for (let i = 0; i < 30; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * (CONFIG.roadWidth/2 + 35 + Math.random() * 50);
        const z = i * 80 + 60 + Math.random() * 40;
        createBuilding(x, z);
    }
}

function createTree(x, z) {
    const group = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 3.5, 10);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.75;
    trunk.castShadow = true;
    group.add(trunk);
    
    // Foliage - multiple layers for realism
    const foliageColors = [0x2E7D32, 0x388E3C, 0x43A047];
    for (let i = 0; i < 3; i++) {
        const foliageGeo = new THREE.ConeGeometry(2.8 - i * 0.5, 5.5 - i * 0.8, 10);
        const foliageMat = new THREE.MeshLambertMaterial({ 
            color: foliageColors[i % foliageColors.length] 
        });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 5.5 + i * 1.5;
        foliage.rotation.y = i * 0.5;
        foliage.castShadow = true;
        group.add(foliage);
    }
    
    group.position.set(x, 0, z);
    scene.add(group);
    scenery.push({ mesh: group, type: 'tree', z: z });
}

function createMountain(x, z) {
    const height = 60 + Math.random() * 60;
    const width = 70 + Math.random() * 50;
    
    const geo = new THREE.ConeGeometry(width, height, 8);
    const mat = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0.3, 0.25, 0.32 + Math.random() * 0.18)
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2 - 15, z);
    mesh.rotation.y = Math.random() * Math.PI;
    scene.add(mesh);
    scenery.push({ mesh, type: 'mountain', z: z });
}

function createBuilding(x, z) {
    const height = 12 + Math.random() * 30;
    const width = 10 + Math.random() * 12;
    const depth = 10 + Math.random() * 12;
    
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color().setHSL(0, 0, 0.28 + Math.random() * 0.35)
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height/2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    scenery.push({ mesh, type: 'building', z: z });
}

// ═══════════════════════════════════════════════════════════════════
// REALISTIC PLAYER CAR - Enhanced 3D Model
// ═══════════════════════════════════════════════════════════════════

function createPlayerCar() {
    playerCar = new THREE.Group();
    
    // Car body - sleek sports car design
    const bodyGeo = new THREE.BoxGeometry(2.2, 1.1, 4.8);
    const bodyMat = new THREE.MeshPhongMaterial({ 
        color: 0xE60012,
        shininess: 90,
        specular: 0x444444
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.85, 0);
    body.castShadow = true;
    playerCar.add(body);
    
    // Car roof/cabin
    const roofGeo = new THREE.BoxGeometry(2.0, 0.85, 2.8);
    const roofMat = new THREE.MeshPhongMaterial({ 
        color: 0xC60010,
        shininess: 80
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 1.55, -0.3);
    roof.castShadow = true;
    playerCar.add(roof);
    
    // Hood (front)
    const hoodGeo = new THREE.BoxGeometry(2.1, 0.4, 1.2);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, 1.05, 1.9);
    hood.rotation.x = -0.1;
    hood.castShadow = true;
    playerCar.add(hood);
    
    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.95, 0.75, 1.8);
    const windshieldMat = new THREE.MeshPhongMaterial({ 
        color: 0x60A5FA, 
        transparent: true, 
        opacity: 0.75,
        shininess: 95
    });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0, 1.75, 0.6);
    windshield.rotation.x = 0.15;
    playerCar.add(windshield);
    
    // Headlights with glow
    const hlGeo = new THREE.BoxGeometry(0.45, 0.35, 0.15);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
    const hlL = new THREE.Mesh(hlGeo, hlMat);
    hlL.position.set(-0.75, 0.75, 2.45);
    playerCar.add(hlL);
    const hlR = new THREE.Mesh(hlGeo, hlMat);
    hlR.position.set(0.75, 0.75, 2.45);
    playerCar.add(hlR);
    
    // Taillights
    const tlGeo = new THREE.BoxGeometry(0.4, 0.3, 0.1);
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
    const tlL = new THREE.Mesh(tlGeo, tlMat);
    tlL.position.set(-0.7, 0.8, -2.45);
    playerCar.add(tlL);
    const tlR = new THREE.Mesh(tlGeo, tlMat);
    tlR.position.set(0.7, 0.8, -2.45);
    playerCar.add(tlR);
    
    // Realistic wheels with rims
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 20);
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const rimMat = new THREE.MeshPhongMaterial({ color: 0xCCCCCC, shininess: 100 });
    
    const wheelPositions = [
        [-0.95, 0.55, 1.5],  // Front left
        [0.95, 0.55, 1.5],   // Front right
        [-0.95, 0.55, -1.5], // Rear left
        [0.95, 0.55, -1.5]   // Rear right
    ];
    
    wheelPositions.forEach(([x, y, z]) => {
        const wheelGroup = new THREE.Group();
        
        // Tire
        const tire = new THREE.Mesh(wheelGeo, tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);
        
        // Rim
        const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.47, 20);
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);
        
        wheelGroup.position.set(x, y, z);
        playerCar.add(wheelGroup);
    });
    
    // Spoiler
    const spoilerBaseGeo = new THREE.BoxGeometry(1.8, 0.15, 0.3);
    const spoilerBase = new THREE.Mesh(spoilerBaseGeo, bodyMat);
    spoilerBase.position.set(0, 1.45, -2.2);
    spoilerBase.castShadow = true;
    playerCar.add(spoilerBase);
    
    const spoilerWingGeo = new THREE.BoxGeometry(1.9, 0.08, 0.6);
    const spoilerWing = new THREE.Mesh(spoilerWingGeo, bodyMat);
    spoilerWing.position.set(0, 1.6, -2.3);
    spoilerWing.rotation.x = -0.2;
    spoilerWing.castShadow = true;
    playerCar.add(spoilerWing);
    
    // P&T Townhall Logo on sides
    const logoCanvas = createLogoCanvas();
    const logoTexture = new THREE.CanvasTexture(logoCanvas);
    const logoGeo = new THREE.PlaneGeometry(1.5, 1.5);
    const logoMat = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
    
    const logoL = new THREE.Mesh(logoGeo, logoMat);
    logoL.position.set(-1.11, 1.2, 0.5);
    logoL.rotation.y = -Math.PI / 2;
    playerCar.add(logoL);
    
    const logoR = new THREE.Mesh(logoGeo, logoMat);
    logoR.position.set(1.11, 1.2, 0.5);
    logoR.rotation.y = Math.PI / 2;
    playerCar.add(logoR);
    
    // Position car
    playerCar.position.set(0, 0, 6);
    scene.add(playerCar);
}

function createLogoCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Gradient background
    const gradient = ctx.createRadialGradient(128, 128, 40, 128, 128, 110);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    // Lightning bolt icon
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 140px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 128, 128);
    
    // Text
    ctx.fillStyle = '#E60012';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('P&T', 128, 200);
    
    return canvas;
}

// ═══════════════════════════════════════════════════════════════════
// PLAYER REGISTRATION & LEADERBOARD
// ═══════════════════════════════════════════════════════════════════

function setupEvents() {
    // Player name input
    const nameInput = document.getElementById('playerNameInput');
    const startBtn = document.getElementById('startRaceBtn');
    
    nameInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        startBtn.disabled = value.length < 2;
        if (value.length >= 2) {
            playerData.name = value;
        }
    });
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !startBtn.disabled) {
            startRaceFromRegistration();
        }
    });
    
    // Buttons
    startBtn.addEventListener('click', startRaceFromRegistration);
    document.getElementById('viewLeaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('lbBackBtn').addEventListener('click', hideLeaderboard);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('quitBtn').addEventListener('click', quitToMenu);
    document.getElementById('retryBtn').addEventListener('click', restartGame);
    document.getElementById('menuBtn').addEventListener('click', quitToMenu);
    document.getElementById('viewFinalLBBtn').addEventListener('click', showLeaderboard);
    
    // Sound toggle
    document.getElementById('soundBtn').addEventListener('click', () => {
        const isMuted = soundEngine.toggleMute();
        document.getElementById('soundBtn').textContent = isMuted ? '🔇' : '🔊';
        document.getElementById('soundBtn').classList.toggle('muted', isMuted);
    });
    
    // Initialize audio on first interaction
    document.addEventListener('click', () => {
        soundEngine.init();
        soundEngine.resume();
    }, { once: true });
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing') return;
        
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
    
    // Resize
    window.addEventListener('resize', onResize);
}

function setupMobileControls() {
    const mLeft = document.getElementById('mLeft');
    const mRight = document.getElementById('mRight');
    const mNitro = document.getElementById('mNitro');
    
    mLeft.addEventListener('touchstart', (e) => { e.preventDefault(); input.left = true; input.up = true; });
    mLeft.addEventListener('touchend', () => { input.left = false; });
    
    mRight.addEventListener('touchstart', (e) => { e.preventDefault(); input.right = true; input.up = true; });
    mRight.addEventListener('touchend', () => { input.right = false; });
    
    mNitro.addEventListener('touchstart', (e) => { e.preventDefault(); input.nitro = true; input.up = true; });
    mNitro.addEventListener('touchend', () => { input.nitro = false; });
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        const data = await response.json();
        
        if (data.success) {
            updateLeaderboardDisplay(data.leaderboard, data.totalPlayers);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/api/stats`);
        const data = await response.json();
        
        if (data.success && data.stats) {
            document.getElementById('lbTotalPlayers').textContent = data.stats.totalPlayers || 0;
            document.getElementById('lbTotalGames').textContent = data.stats.totalGames || 0;
            document.getElementById('lbHighScore').textContent = Math.floor(data.stats.highestScore || 0).toLocaleString();
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateLeaderboardDisplay(leaderboard, totalPlayers) {
    // Update podium (top 3)
    const podiumData = [
        { name: 'lb1Name', score: 'lb1Score', dist: 'lb1Dist' },
        { name: 'lb2Name', score: 'lb2Score', dist: 'lb2Dist' },
        { name: 'lb3Name', score: 'lb3Score', dist: 'lb3Dist' }
    ];
    
    podiumData.forEach((p, i) => {
        if (leaderboard[i]) {
            document.getElementById(p.name).textContent = leaderboard[i].playerName;
            document.getElementById(p.score).textContent = Math.floor(leaderboard[i].score).toLocaleString();
            document.getElementById(p.dist).textContent = leaderboard[i].distance.toFixed(1);
        } else {
            document.getElementById(p.name).textContent = '---';
            document.getElementById(p.score).textContent = '0';
            document.getElementById(p.dist).textContent = '0';
        }
    });
    
    // Update rest of list (4-10)
    const listContainer = document.getElementById('lbList');
    listContainer.innerHTML = '';
    
    for (let i = 3; i < Math.min(leaderboard.length, 10); i++) {
        const item = leaderboard[i];
        const div = document.createElement('div');
        div.className = 'lb-list-item';
        div.innerHTML = `
            <div class="lbi-rank">#${i + 1}</div>
            <div class="lbi-name">${item.playerName}</div>
            <div class="lbi-score">${Math.floor(item.score).toLocaleString()}</div>
            <div class="lbi-dist">${item.distance.toFixed(1)} KM</div>
        `;
        listContainer.appendChild(div);
    }
    
    // Load stats
    loadStats();
}

function showLeaderboard() {
    loadLeaderboard();
    document.getElementById('registrationScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('leaderboardScreen').classList.remove('hidden');
    gameState = 'leaderboard';
}

function hideLeaderboard() {
    document.getElementById('leaderboardScreen').classList.add('hidden');
    document.getElementById('registrationScreen').classList.remove('hidden');
    gameState = 'registration';
}

async function submitScore() {
    try {
        const response = await fetch(`${API_URL}/api/submit-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playerName: playerData.name,
                score: stats.score,
                distance: stats.distance,
                maxSpeed: stats.maxSpeed
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update rank display
            document.getElementById('goRank').textContent = data.rank || '-';
            document.getElementById('goTotal').textContent = data.totalPlayers || '-';
            document.getElementById('goRankDisplay').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error submitting score:', error);
        document.getElementById('goRankDisplay').style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════════════
// OBSTACLE VEHICLES - More Realistic
// ═══════════════════════════════════════════════════════════════════

function createObstacle() {
    const types = ['sedan', 'suv', 'truck'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = [0x3B82F6, 0x10B981, 0xF59E0B, 0x8B5CF6, 0xEF4444, 0x06B6D4, 0xFFFFFF, 0x111111];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const vehicle = new THREE.Group();
    
    if (type === 'sedan') {
        // Modern sedan
        const bodyGeo = new THREE.BoxGeometry(2.1, 1.15, 4.6);
        const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 70 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.88;
        body.castShadow = true;
        vehicle.add(body);
        
        const roofGeo = new THREE.BoxGeometry(1.9, 0.9, 2.5);
        const roof = new THREE.Mesh(roofGeo, bodyMat);
        roof.position.set(0, 1.75, -0.4);
        roof.castShadow = true;
        vehicle.add(roof);
        
    } else if (type === 'suv') {
        // SUV/Crossover
        const bodyGeo = new THREE.BoxGeometry(2.3, 1.6, 4.8);
        const bodyMat = new THREE.MeshPhongMaterial({ color, shininess: 60 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.2;
        body.castShadow = true;
        vehicle.add(body);
        
        const roofGeo = new THREE.BoxGeometry(2.2, 0.9, 3);
        const roof = new THREE.Mesh(roofGeo, bodyMat);
        roof.position.set(0, 2.05, -0.2);
        roof.castShadow = true;
        vehicle.add(roof);
        
    } else {
        // Commercial truck
        const containerGeo = new THREE.BoxGeometry(2.5, 2.5, 5.2);
        const containerMat = new THREE.MeshPhongMaterial({ color, shininess: 40 });
        const container = new THREE.Mesh(containerGeo, containerMat);
        container.position.set(0, 1.75, -0.6);
        container.castShadow = true;
        vehicle.add(container);
        
        const cabinGeo = new THREE.BoxGeometry(2.3, 2.1, 2);
        const cabinMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 50 });
        const cabin = new THREE.Mesh(cabinGeo, cabinMat);
        cabin.position.set(0, 1.6, 2.6);
        cabin.castShadow = true;
        vehicle.add(cabin);
    }
    
    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.42, 16);
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    [[-0.9, 1.9], [-0.9, -1.9], [0.9, 1.9], [0.9, -1.9]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.5, z);
        wheel.castShadow = true;
        vehicle.add(wheel);
    });
    
    // Random lane
    const lane = (Math.floor(Math.random() * 3) - 1) * CONFIG.laneWidth;
    vehicle.position.set(lane, 0, 280 + Math.random() * 120);
    
    vehicle.userData = {
        type,
        speed: 50 + Math.random() * 100,
        lane
    };
    
    scene.add(vehicle);
    obstacles.push(vehicle);
}

// Continue with game loop and other functions...

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
        if (input.nitro && playerData.nitro > 0) {
            targetSpeed *= CONFIG.nitroBoost;
            playerData.nitro = Math.max(0, playerData.nitro - CONFIG.nitroDrain * dt * 60);
            playerData.isNitro = true;
            
            if (!soundState.wasNitro) {
                soundEngine.playNitro();
                soundState.wasNitro = true;
            }
        } else {
            playerData.isNitro = false;
            soundState.wasNitro = false;
        }
    } else if (input.down) {
        targetSpeed = -25;
        
        if (!soundState.isBraking && playerData.speed > 60) {
            soundEngine.playBrake();
            soundState.isBraking = true;
        }
    } else {
        soundState.isBraking = false;
        soundState.wasNitro = false;
    }
    
    if (!input.down) {
        soundState.isBraking = false;
    }
    
    // Nitro regeneration
    if (!input.nitro && playerData.nitro < 100) {
        playerData.nitro = Math.min(100, playerData.nitro + CONFIG.nitroRegen * dt * 60);
    }
    
    // Apply acceleration
    if (playerData.speed < targetSpeed) {
        playerData.speed += CONFIG.acceleration * dt * 60;
    } else {
        playerData.speed -= CONFIG.deceleration * dt * 60;
    }
    playerData.speed = Math.max(0, playerData.speed);
    
    // Update engine sound
    soundEngine.updateEngine(playerData.speed, isAccelerating);
    
    // Track max speed
    if (playerData.speed > stats.maxSpeed) stats.maxSpeed = playerData.speed;
    
    // Steering
    const turnAmount = CONFIG.turnSpeed * (playerData.speed / 100) * dt * 60;
    if (input.left) playerData.x += turnAmount;
    if (input.right) playerData.x -= turnAmount;
    playerData.x = Math.max(-CONFIG.roadWidth/2 + 1.5, Math.min(CONFIG.roadWidth/2 - 1.5, playerData.x));
    
    // Update player car
    playerCar.position.x = playerData.x;
    playerCar.rotation.y = (input.left ? -0.12 : input.right ? 0.12 : 0) * (playerData.speed / CONFIG.maxSpeed);
    playerCar.rotation.z = (input.left ? -0.04 : input.right ? 0.04 : 0);
    
    // Move world
    const moveAmount = playerData.speed * dt * 0.18;
    
    // Move scenery
    scenery.forEach(item => {
        item.mesh.position.z -= moveAmount;
        
        if (item.mesh.position.z < -60) {
            item.mesh.position.z += 2500;
            if (item.type === 'tree' || item.type === 'building') {
                const side = Math.random() > 0.5 ? 1 : -1;
                item.mesh.position.x = side * (CONFIG.roadWidth/2 + 10 + Math.random() * 50);
            }
        }
    });
    
    // Move and check obstacles
    obstacles.forEach((obs, i) => {
        obs.position.z -= moveAmount - obs.userData.speed * dt * 0.1;
        
        if (obs.position.z < -35) {
            scene.remove(obs);
            obstacles.splice(i, 1);
            stats.score += 120;
            soundEngine.playScore();
        }
        
        // Collision detection
        const dx = Math.abs(playerCar.position.x - obs.position.x);
        const dz = Math.abs(playerCar.position.z - obs.position.z);
        
        if (dx < 2.0 && dz < 4.5) {
            handleCollision();
        }
    });
    
    // Spawn obstacles
    if (Math.random() < 0.018 && obstacles.length < 14) {
        createObstacle();
    }
    
    // Update stats
    stats.distance += playerData.speed * dt * 0.0012;
    stats.score += Math.floor(playerData.speed * dt * 0.12);
    
    // Update HUD
    updateHUD();
    
    // Visual effects
    updateEffects();
}

function updateHUD() {
    document.getElementById('hudScore').textContent = Math.floor(stats.score).toLocaleString();
    document.getElementById('hudDist').textContent = stats.distance.toFixed(1);
    document.getElementById('hudSpeedNum').textContent = Math.floor(playerData.speed);
    document.getElementById('speedoValue').textContent = Math.floor(playerData.speed);
    document.getElementById('speedoMax').textContent = Math.floor(stats.maxSpeed);
    
    // Speed bar
    const speedPercent = Math.min(playerData.speed / CONFIG.maxSpeed, 1);
    document.getElementById('speedFill').style.width = (speedPercent * 100) + '%';
    
    // Nitro bar
    document.getElementById('nitroFill').style.width = playerData.nitro + '%';
    
    // Speedometer circle
    const maxSpeedWithNitro = CONFIG.maxSpeed * CONFIG.nitroBoost;
    const speedPercentTotal = playerData.speed / maxSpeedWithNitro;
    const dashOffset = 565 - (565 * Math.min(speedPercentTotal, 1) * 0.75);
    document.getElementById('speedoProgress').style.strokeDashoffset = dashOffset;
}

function updateEffects() {
    const speedLines = document.getElementById('speedLines');
    if (playerData.speed > 180) {
        speedLines.classList.add('active');
    } else {
        speedLines.classList.remove('active');
    }
    
    const boostOverlay = document.getElementById('boostOverlay');
    if (playerData.isNitro) {
        boostOverlay.classList.add('active');
    } else {
        boostOverlay.classList.remove('active');
    }
}

function handleCollision() {
    // Show explosion effect
    showExplosion();
    
    // Play explosion sound
    soundEngine.playExplosion();
    
    // End game after short delay
    setTimeout(() => {
        gameOver();
    }, 500);
}

function showExplosion() {
    const explosion = document.getElementById('explosionEffect');
    explosion.classList.remove('hidden');
    
    setTimeout(() => {
        explosion.classList.add('hidden');
    }, 800);
}

// ═══════════════════════════════════════════════════════════════════
// GAME STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function startRaceFromRegistration() {
    if (playerData.name.length < 2) return;
    
    soundEngine.init();
    soundEngine.resume();
    
    document.getElementById('registrationScreen').classList.add('hidden');
    startGame();
}

function startGame() {
    // Reset game state
    playerData.x = 0;
    playerData.speed = 0;
    playerData.nitro = 100;
    playerData.isNitro = false;
    stats.score = 0;
    stats.distance = 0;
    stats.maxSpeed = 0;
    
    soundState.isBraking = false;
    soundState.wasNitro = false;
    
    // Clear obstacles
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    
    // Reset car
    playerCar.position.set(0, 0, 6);
    playerCar.rotation.set(0, 0, 0);
    
    // Update HUD with player name
    document.getElementById('hudPlayerName').textContent = playerData.name;
    
    // Hide other screens
    document.getElementById('gameOverScreen').classList.add('hidden');
    
    // Start countdown
    startCountdown();
}

function startCountdown() {
    const overlay = document.getElementById('countdownOverlay');
    const numEl = document.getElementById('countdownNum');
    
    // Set player name
    document.getElementById('countdownPlayerName').textContent = playerData.name;
    
    overlay.classList.remove('hidden');
    let count = 3;
    numEl.textContent = count;
    soundEngine.playBeep(false);
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.textContent = count;
            soundEngine.playBeep(false);
        } else if (count === 0) {
            numEl.textContent = 'GO!';
            numEl.style.color = '#00FF88';
            soundEngine.playBeep(true);
        } else {
            clearInterval(interval);
            overlay.classList.add('hidden');
            numEl.style.color = '';
            
            // Start game
            gameState = 'playing';
            document.getElementById('gameHUD').classList.remove('hidden');
            
            soundEngine.startEngine();
            
            // Spawn initial obstacles
            for (let i = 0; i < 6; i++) {
                createObstacle();
            }
        }
    }, 1000);
}

function gameOver() {
    gameState = 'gameover';
    
    soundEngine.stopEngine();
    
    // Update game over screen
    document.getElementById('goPlayerName').textContent = playerData.name;
    document.getElementById('goScore').textContent = Math.floor(stats.score).toLocaleString();
    document.getElementById('goDist').textContent = stats.distance.toFixed(1);
    document.getElementById('goSpeed').textContent = Math.floor(stats.maxSpeed);
    
    // Submit score to leaderboard
    submitScore();
    
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
    gameState = 'registration';
    isPaused = false;
    
    soundEngine.stopEngine();
    
    // Clear
    obstacles.forEach(o => scene.remove(o));
    obstacles = [];
    
    // Reset input
    Object.keys(input).forEach(key => input[key] = false);
    
    // Hide all, show registration
    document.getElementById('gameHUD').classList.add('hidden');
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('speedLines').classList.remove('active');
    document.getElementById('boostOverlay').classList.remove('active');
    document.getElementById('registrationScreen').classList.remove('hidden');
    
    // Reload leaderboard
    loadLeaderboard();
}

// ═══════════════════════════════════════════════════════════════════
// START APPLICATION
// ═══════════════════════════════════════════════════════════════════

init();
animate();