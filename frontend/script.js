/**
 * IGRIS - Interactive Graphical Real-time Intelligent System
 * 3D Animated AI Core Interface using Three.js
 */

// ==================== Global State ====================
const IGRIS = {
    state: 'initializing', // initializing, idle, listening, thinking, speaking
    livekitRoom: null,
    isConnected: false,
    isListening: false,
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    clock: null,
    
    // 3D Objects
    rings: [],
    particles: null,
    core: null,
    pulseRings: [],
    
    // Animation parameters
    animParams: {
        rotationSpeed: 0.001,
        pulseIntensity: 0.5,
        particleSpeed: 0.001
    }
};

// ==================== Colors ====================
const COLORS = {
    cyan: 0x00f5ff,
    cyanDim: 0x00a8b3,
    blue: 0x0088ff,
    violet: 0x8b5cf6,
    magenta: 0xff00ff,
    pink: 0xff4d9a,
    white: 0xffffff,
    dark: 0x030308
};

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('[IGRIS]: Initializing system...');
    
    // Show boot sequence
    showBootSequence();
    
    // Initialize Three.js scene
    setTimeout(() => {
        initScene();
        initObjects();
        initEventListeners();
        connectLiveKit();
        animate();
        
        // Update system time
        updateSystemTime();
        setInterval(updateSystemTime, 1000);
        
        setState('idle');
    }, 1000);
});

// ==================== Boot Sequence ====================
function showBootSequence() {
    const bootScreen = document.createElement('div');
    bootScreen.id = 'boot-screen';
    bootScreen.innerHTML = `
        <div class="boot-text" style="animation-delay: 0s;">INITIALIZING CORE SYSTEMS...</div>
    `;
    document.body.appendChild(bootScreen);
    
    // Boot sequence messages
    const messages = [
        'LOADING NEURAL NETWORKS...',
        'CALIBRATING VOICE INTERFACE...',
        'ESTABLISHING CONNECTIONS...',
        'IGRIS ONLINE'
    ];
    
    let currentMsg = 0;
    const bootInterval = setInterval(() => {
        if (currentMsg < messages.length) {
            bootScreen.querySelector('.boot-text').textContent = messages[currentMsg];
            currentMsg++;
        } else {
            clearInterval(bootInterval);
        }
    }, 600);
    
    // Remove boot screen
    setTimeout(() => {
        bootScreen.style.opacity = '0';
        setTimeout(() => bootScreen.remove(), 500);
    }, 3000);
}

// ==================== Three.js Scene Setup ====================
function initScene() {
    const canvas = document.getElementById('igris-canvas');
    const container = document.getElementById('canvas-container');
    
    // Scene
    IGRIS.scene = new THREE.Scene();
    IGRIS.scene.background = new THREE.Color(COLORS.dark);
    IGRIS.scene.fog = new THREE.Fog(COLORS.dark, 5, 20);
    
    // Camera
    IGRIS.camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    IGRIS.camera.position.z = 8;
    
    IGRIS.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    IGRIS.renderer.setSize(container.clientWidth, container.clientHeight);
    IGRIS.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    IGRIS.renderer.toneMapping = THREE.ReinhardToneMapping;
    IGRIS.renderer.toneMappingExposure = 1.5;
    
    // Setup Bloom Post-Processing
    const renderScene = new THREE.RenderPass(IGRIS.scene, IGRIS.camera);
    
    // Resolution, strength, radius, threshold
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;
    
    IGRIS.composer = new THREE.EffectComposer(IGRIS.renderer);
    IGRIS.composer.addPass(renderScene);
    IGRIS.composer.addPass(bloomPass);
    
    // Clock
    IGRIS.clock = new THREE.Clock();
    
    // Handle resize
    window.addEventListener('resize', () => {
        IGRIS.camera.aspect = container.clientWidth / container.clientHeight;
        IGRIS.camera.updateProjectionMatrix();
        IGRIS.renderer.setSize(container.clientWidth, container.clientHeight);
        IGRIS.composer.setSize(container.clientWidth, container.clientHeight);
    });
}

// ==================== 3D Objects ====================
function initObjects() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x111111);
    IGRIS.scene.add(ambientLight);
    
    // Point lights
    const pointLight1 = new THREE.PointLight(COLORS.cyan, 1, 20);
    pointLight1.position.set(0, 0, 5);
    IGRIS.scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(COLORS.violet, 0.5, 15);
    pointLight2.position.set(5, 5, 3);
    IGRIS.scene.add(pointLight2);
    
    // Create the AI core
    createCore();
    
    // Create rotating rings
    createRings();
    
    // Create particle system
    createParticles();
    
    // Create pulse rings
    createPulseRings();
    
    // Create data lines
    createDataLines();
}

function createCore() {
    // Inner glowing sphere
    const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.8
    });
    IGRIS.core = new THREE.Mesh(coreGeometry, coreMaterial);
    IGRIS.scene.add(IGRIS.core);
    
    // Core glow
    const glowGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });
    const coreGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    IGRIS.scene.add(coreGlow);
}

function createRings() {
    const ringConfigs = [
        { radius: 1.2, thickness: 0.02, color: COLORS.cyan, speed: 0.003, tilt: 0.3 },
        { radius: 1.5, thickness: 0.015, color: COLORS.cyanDim, speed: -0.002, tilt: -0.2 },
        { radius: 1.8, thickness: 0.02, color: COLORS.violet, speed: 0.004, tilt: 0.4 },
        { radius: 2.2, thickness: 0.01, color: COLORS.cyan, speed: -0.003, tilt: -0.1 },
        { radius: 2.5, thickness: 0.015, color: COLORS.pink, speed: 0.002, tilt: 0.5 },
        { radius: 2.9, thickness: 0.01, color: COLORS.cyanDim, speed: -0.001, tilt: -0.3 },
    ];
    
    ringConfigs.forEach((config, index) => {
        const geometry = new THREE.TorusGeometry(config.radius, config.thickness, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2 + config.tilt;
        ring.userData = { speed: config.speed, baseOpacity: 0.6 };
        
        IGRIS.rings.push(ring);
        IGRIS.scene.add(ring);
    });
    
    // Vertical rings
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.TorusGeometry(1.6 + i * 0.3, 0.01, 16, 100);
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.cyan,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.y = (Math.PI / 3) * i;
        ring.userData = { speed: 0.001 + i * 0.0005, isVertical: true };
        
        IGRIS.rings.push(ring);
        IGRIS.scene.add(ring);
    }
}

function createParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorCyan = new THREE.Color(COLORS.cyan);
    const colorViolet = new THREE.Color(COLORS.violet);
    
    for (let i = 0; i < particleCount; i++) {
        // Spherical distribution
        const radius = 2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Mix colors
        const mixColor = Math.random() > 0.5 ? colorCyan : colorViolet;
        colors[i * 3] = mixColor.r;
        colors[i * 3 + 1] = mixColor.g;
        colors[i * 3 + 2] = mixColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    IGRIS.particles = new THREE.Points(geometry, material);
    IGRIS.scene.add(IGRIS.particles);
}

function createPulseRings() {
    for (let i = 0; i < 3; i++) {
        const geometry = new THREE.RingGeometry(0.8, 0.85, 64);
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.cyan,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.userData = { 
            scale: 1, 
            opacity: 0, 
            active: false,
            delay: i * 0.3
        };
        
        IGRIS.pulseRings.push(ring);
        IGRIS.scene.add(ring);
    }
}

function createDataLines() {
    // Horizontal scanner line
    const lineMaterial = new THREE.LineBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.5
    });
    
    const points = [
        new THREE.Vector3(-4, 0, 0),
        new THREE.Vector3(4, 0, 0)
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const scanLine = new THREE.Line(lineGeometry, lineMaterial);
    IGRIS.scene.add(scanLine);
    
    // Corner brackets
    const bracketMaterial = new THREE.LineBasicMaterial({
        color: COLORS.cyan,
        transparent: true,
        opacity: 0.4
    });
    
    const bracketSize = 0.3;
    const positions = [
        { x: -3, y: 2 },
        { x: 3, y: 2 },
        { x: -3, y: -2 },
        { x: 3, y: -2 }
    ];
    
    positions.forEach((pos, i) => {
        const dirX = pos.x > 0 ? -1 : 1;
        const dirY = pos.y > 0 ? -1 : 1;
        
        const points = [
            new THREE.Vector3(pos.x, pos.y + bracketSize * dirY, 0),
            new THREE.Vector3(pos.x, pos.y, 0),
            new THREE.Vector3(pos.x + bracketSize * dirX, pos.y, 0)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const bracket = new THREE.Line(geometry, bracketMaterial);
        IGRIS.scene.add(bracket);
    });
}

// ==================== Animation Loop ====================
function animate() {
    requestAnimationFrame(animate);
    
    const time = IGRIS.clock.getElapsedTime();
    const delta = IGRIS.clock.getDelta();
    
    // Animate core
    if (IGRIS.core) {
        const pulseScale = 1 + Math.sin(time * 2) * 0.1 * IGRIS.animParams.pulseIntensity;
        IGRIS.core.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Change core color based on state
        updateCoreColor(time);
    }
    
    // Animate rings
    IGRIS.rings.forEach((ring, index) => {
        if (ring.userData.isVertical) {
            ring.rotation.y += ring.userData.speed * (1 + IGRIS.animParams.rotationSpeed * 10);
        } else {
            ring.rotation.z += ring.userData.speed * (1 + IGRIS.animParams.rotationSpeed * 10);
        }
        
        // Pulse opacity
        const opacityPulse = ring.userData.baseOpacity + Math.sin(time * 3 + index) * 0.2;
        ring.material.opacity = opacityPulse * IGRIS.animParams.pulseIntensity;
    });
    
    // Animate particles
    if (IGRIS.particles) {
        IGRIS.particles.rotation.y += IGRIS.animParams.particleSpeed;
        IGRIS.particles.rotation.x += IGRIS.animParams.particleSpeed * 0.5;
    }
    
    // Animate pulse rings
    animatePulseRings(time);
    
    // Render using composer for bloom
    if (IGRIS.composer) {
        IGRIS.composer.render();
    } else {
        IGRIS.renderer.render(IGRIS.scene, IGRIS.camera);
    }
}

function updateCoreColor(time) {
    let targetColor;
    
    switch (IGRIS.state) {
        case 'listening':
            targetColor = new THREE.Color(COLORS.cyan);
            IGRIS.animParams.pulseIntensity = 1.2;
            IGRIS.animParams.rotationSpeed = 0.003;
            break;
        case 'thinking':
            targetColor = new THREE.Color(COLORS.violet);
            IGRIS.animParams.pulseIntensity = 1.5;
            IGRIS.animParams.rotationSpeed = 0.008;
            break;
        case 'speaking':
            // Pulse between cyan and pink
            const t = (Math.sin(time * 8) + 1) / 2;
            targetColor = new THREE.Color(COLORS.cyan).lerp(new THREE.Color(COLORS.pink), t);
            IGRIS.animParams.pulseIntensity = 1 + Math.sin(time * 10) * 0.5;
            IGRIS.animParams.rotationSpeed = 0.005;
            break;
        default: // idle
            targetColor = new THREE.Color(COLORS.cyan);
            IGRIS.animParams.pulseIntensity = 0.5;
            IGRIS.animParams.rotationSpeed = 0.001;
    }
    
    if (IGRIS.core) {
        IGRIS.core.material.color.lerp(targetColor, 0.05);
    }
}

function animatePulseRings(time) {
    if (IGRIS.state === 'speaking' || IGRIS.state === 'listening') {
        IGRIS.pulseRings.forEach((ring, i) => {
            ring.userData.active = true;
        });
    }
    
    IGRIS.pulseRings.forEach((ring, i) => {
        if (ring.userData.active) {
            ring.userData.scale += 0.02;
            ring.userData.opacity = Math.max(0, 1 - (ring.userData.scale - 1) / 2);
            
            ring.scale.set(ring.userData.scale, ring.userData.scale, 1);
            ring.material.opacity = ring.userData.opacity;
            
            if (ring.userData.scale > 3) {
                ring.userData.scale = 1;
                ring.userData.opacity = 0;
                if (IGRIS.state === 'idle') {
                    ring.userData.active = false;
                }
            }
        }
    });
}

// ==================== State Management ====================
function setState(newState) {
    IGRIS.state = newState;
    console.log(`[IGRIS State]: ${newState.toUpperCase()}`);
    
    // Update UI
    const statusText = document.getElementById('status-text');
    const statusIndicator = document.querySelector('.status-indicator');
    const activateBtn = document.getElementById('btn-activate');
    
    statusIndicator.className = 'status-indicator ' + newState;
    
    switch (newState) {
        case 'listening':
            statusText.textContent = 'LISTENING';
            activateBtn.classList.add('active');
            activateBtn.querySelector('.btn-text').textContent = 'LISTENING';
            break;
        case 'thinking':
            statusText.textContent = 'PROCESSING';
            break;
        case 'speaking':
            statusText.textContent = 'SPEAKING';
            break;
        case 'idle':
        default:
            statusText.textContent = 'READY';
            activateBtn.classList.remove('active');
            activateBtn.querySelector('.btn-text').textContent = 'ACTIVATE';
    }
}

// ==================== LiveKit Connection ====================
async function connectLiveKit() {
    console.log('[LiveKit]: Fetching connection details from /api/connection-details...');
    
    try {
        const response = await fetch('/api/connection-details');
        const data = await response.json();
        
        if (data.error) {
            console.error('[LiveKit Error]:', data.error);
            showResponse('LiveKit configuration error: ' + data.error);
            document.getElementById('net-status').textContent = 'ERROR';
            return;
        }

        const room = new LivekitClient.Room({
            adaptiveStream: true,
            dynacast: true,
        });
        IGRIS.livekitRoom = room;

        room.on(LivekitClient.RoomEvent.Connected, () => {
            console.log('[LiveKit]: Connected to room', room.name);
            IGRIS.isConnected = true;
            document.getElementById('net-status').textContent = 'LK-ONLINE';
            showResponse('Connected to LiveKit Realtime Agent');
        });

        room.on(LivekitClient.RoomEvent.Disconnected, () => {
            console.log('[LiveKit]: Disconnected');
            IGRIS.isConnected = false;
            document.getElementById('net-status').textContent = 'OFFLINE';
        });

        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log('[LiveKit]: Track subscribed', track.kind, 'from', participant.identity);
            if (track.kind === LivekitClient.Track.Kind.Audio) {
                // Attach the audio track to the DOM
                const audioElement = track.attach();
                document.body.appendChild(audioElement);
                
                // Set up audio analyzer for visualization
                setupAudioVisualization(audioElement);
            }
        });

        room.on(LivekitClient.RoomEvent.DataReceived, (payload, participant, kind, topic) => {
            const decoder = new TextDecoder();
            const message = decoder.decode(payload);
            console.log('[LiveKit Data]:', message);
            
            try {
                const data = JSON.parse(message);
                if (data.type === 'change_color' && data.color) {
                    changeCoreColor(data.color);
                    return;
                }
            } catch (e) {
                // Not JSON, continue to normal handling
            }
            
            // Show any transcripts or messages from the agent
            showResponse(message);
        });

        // Join the room
        await room.connect(data.serverUrl, data.token);
        console.log('[LiveKit]: Successfully joined room');
        
    } catch (error) {
        console.error('[LiveKit]: Connection failed', error);
        showResponse('LiveKit connection failed. Check console.');
        document.getElementById('net-status').textContent = 'ERROR';
    }
}

// ==================== UI Functions ====================
let typeWriterTimeout = null;

function showResponse(text) {
    const responseEl = document.getElementById('response-text');
    responseEl.classList.add('visible');
    
    // Clear previous typing
    if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
    responseEl.textContent = '';
    
    let i = 0;
    function typeWriter() {
        if (i < text.length) {
            responseEl.textContent += text.charAt(i);
            i++;
            typeWriterTimeout = setTimeout(typeWriter, 30); // 30ms per char
        } else {
            // Hide after a while once typing is complete
            typeWriterTimeout = setTimeout(() => {
                responseEl.classList.remove('visible');
            }, 8000);
        }
    }
    
    typeWriter();
}

function updateSystemTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('sys-time').textContent = time;
}

function changeCoreColor(colorName) {
    // Basic color map
    const colorMap = {
        'red': 0xff0000,
        'green': 0x00ff00,
        'blue': 0x0000ff,
        'yellow': 0xffff00,
        'cyan': 0x00ffff,
        'magenta': 0xff00ff,
        'orange': 0xffa500,
        'pink': 0xffc0cb,
        'purple': 0x800080
    };
    
    if (colorMap[colorName.toLowerCase()]) {
        COLORS.cyan = colorMap[colorName.toLowerCase()];
    } else if (COLORS[colorName]) {
        COLORS.cyan = COLORS[colorName];
    } else {
        // Map hex code or standard
        try {
            COLORS.cyan = parseInt(colorName.replace('#', ''), 16) || 0x00f5ff;
        } catch(e) {
            // keep default
        }
    }
    showResponse(`System color updated to ${colorName}`);
}

// ==================== Event Listeners ====================
function initEventListeners() {
    // Activate button toggles Local Microphone
    const activateBtn = document.getElementById('btn-activate');
    activateBtn.addEventListener('click', async () => {
        if (IGRIS.isConnected && IGRIS.livekitRoom) {
            try {
                if (IGRIS.isListening) {
                    await IGRIS.livekitRoom.localParticipant.setMicrophoneEnabled(false);
                    IGRIS.isListening = false;
                    setState('idle');
                } else {
                    await IGRIS.livekitRoom.localParticipant.setMicrophoneEnabled(true);
                    IGRIS.isListening = true;
                    setState('listening');
                }
            } catch (error) {
                console.error("Microphone error", error);
                showResponse("Error accessing microphone.");
            }
        } else {
            showResponse('Not connected to LiveKit.');
        }
    });

    // Camera button toggles Vision
    const cameraBtn = document.getElementById('btn-camera');
    if (cameraBtn) {
        cameraBtn.addEventListener('click', async () => {
            if (IGRIS.isConnected && IGRIS.livekitRoom) {
                try {
                    const localParticipant = IGRIS.livekitRoom.localParticipant;
                    if (localParticipant.isCameraEnabled) {
                        await localParticipant.setCameraEnabled(false);
                        cameraBtn.classList.remove('active');
                        showResponse("Vision disabled.");
                    } else {
                        await localParticipant.setCameraEnabled(true);
                        cameraBtn.classList.add('active');
                        showResponse("Vision enabled. I can see you now.");
                    }
                } catch (error) {
                    console.error("Camera error", error);
                    showResponse("Error accessing camera.");
                }
            } else {
                showResponse('Not connected to LiveKit.');
            }
        });
    }
    
    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    resetBtn.addEventListener('click', () => {
        // We can send a reset text message to the agent if supported, or reconnect
        showResponse('Disconnecting and reconnecting...');
        if(IGRIS.livekitRoom) {
            IGRIS.livekitRoom.disconnect();
            setTimeout(connectLiveKit, 1000);
        }
    });
    
    // Text input (for testing)
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('btn-send');
    
    const sendTextInput = () => {
        const text = textInput.value.trim();
        if (text && IGRIS.isConnected) {
            // Encode string
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            // In LiveKit, data messages are sent to the room
            if (IGRIS.livekitRoom && IGRIS.livekitRoom.localParticipant) {
                IGRIS.livekitRoom.localParticipant.publishData(data, { reliable: true });
            }
            showResponse(`You: ${text}`);
            textInput.value = '';
        } else if (!IGRIS.isConnected) {
            showResponse('Not connected to LiveKit.');
        }
    };
    
    sendBtn.addEventListener('click', sendTextInput);
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendTextInput();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space to toggle listening
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            activateBtn.click();
        }
        // Escape to stop
        if (e.code === 'Escape') {
            if (IGRIS.isListening && IGRIS.livekitRoom) {
                IGRIS.livekitRoom.localParticipant.setMicrophoneEnabled(false);
                IGRIS.isListening = false;
                setState('idle');
            }
        }
    });
}

// ==================== Audio Visualization ====================
let audioContext = null;
let analyser = null;
let dataArray = null;

function setupAudioVisualization(audioElement) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    // Some browsers need crossOrigin
    audioElement.crossOrigin = "anonymous";
    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    function updateVisualization() {
        requestAnimationFrame(updateVisualization);
        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);
            
            let sum = 0;
            for(let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const level = Math.min(1.0, average / 128.0);
            
            // Sync state visually
            if (level > 0.05) {
                if (IGRIS.state !== 'speaking' && !IGRIS.isListening) {
                    setState('speaking');
                }
                updateAudioLevel(level);
                
                // Make particles react to audio
                if (IGRIS.particles) {
                    const audioReactScale = 1 + (level * 2);
                    IGRIS.particles.scale.set(audioReactScale, audioReactScale, audioReactScale);
                    IGRIS.animParams.particleSpeed = 0.005 + (level * 0.02);
                }
                
            } else {
                if (IGRIS.state === 'speaking') {
                    setState('idle');
                }
                updateAudioLevel(0.1);
                
                // Reset particles
                if (IGRIS.particles) {
                    IGRIS.particles.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                    IGRIS.animParams.particleSpeed = 0.001;
                }
            }
        }
    }
    
    updateVisualization();
}

function updateAudioLevel(level) {
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach((bar, i) => {
        const height = 5 + (level * 25) * (1 + Math.sin(Date.now() / 100 + i) * 0.5);
        bar.style.height = height + 'px';
    });
}


console.log('[IGRIS]: Script loaded successfully');
