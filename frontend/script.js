/**
 * IGRIS - Interactive Graphical Real-time Intelligent System
 * 3D Animated AI Core Interface using Three.js
 */

// ==================== Global State ====================
const IGRIS = {
    state: 'initializing', // initializing, idle, listening, thinking, speaking
    socket: null,
    isConnected: false,
    isListening: false,
    scene: null,
    camera: null,
    renderer: null,
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
        connectWebSocket();
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
    
    // Renderer
    IGRIS.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    IGRIS.renderer.setSize(container.clientWidth, container.clientHeight);
    IGRIS.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clock
    IGRIS.clock = new THREE.Clock();
    
    // Handle resize
    window.addEventListener('resize', () => {
        IGRIS.camera.aspect = container.clientWidth / container.clientHeight;
        IGRIS.camera.updateProjectionMatrix();
        IGRIS.renderer.setSize(container.clientWidth, container.clientHeight);
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
    
    // Render
    IGRIS.renderer.render(IGRIS.scene, IGRIS.camera);
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

// ==================== WebSocket Connection ====================
function connectWebSocket() {
    const serverUrl = 'http://localhost:5000';
    
    console.log('[WebSocket]: Connecting to', serverUrl);
    
    try {
        IGRIS.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });
        
        // Connection events
        IGRIS.socket.on('connect', () => {
            console.log('[WebSocket]: Connected');
            IGRIS.isConnected = true;
            document.getElementById('net-status').textContent = 'ONLINE';
            
            // Request greeting
            setTimeout(() => {
                IGRIS.socket.emit('request_greeting');
            }, 500);
        });
        
        IGRIS.socket.on('disconnect', () => {
            console.log('[WebSocket]: Disconnected');
            IGRIS.isConnected = false;
            document.getElementById('net-status').textContent = 'OFFLINE';
        });
        
        IGRIS.socket.on('connect_error', (error) => {
            console.warn('[WebSocket]: Connection error', error.message);
            document.getElementById('net-status').textContent = 'ERROR';
        });
        
        // IGRIS events
        IGRIS.socket.on('state_change', (data) => {
            setState(data.state);
        });
        
        IGRIS.socket.on('ai_response', (data) => {
            showResponse(data.text);
        });
        
        IGRIS.socket.on('user_input', (data) => {
            console.log('[User Said]:', data.text);
        });
        
        IGRIS.socket.on('listening_started', () => {
            IGRIS.isListening = true;
        });
        
        IGRIS.socket.on('listening_stopped', () => {
            IGRIS.isListening = false;
        });
        
    } catch (error) {
        console.error('[WebSocket]: Failed to connect', error);
    }
}

// ==================== UI Functions ====================
function showResponse(text) {
    const responseEl = document.getElementById('response-text');
    responseEl.textContent = text;
    responseEl.classList.add('visible');
    
    // Hide after a while
    setTimeout(() => {
        responseEl.classList.remove('visible');
    }, 8000);
}

function updateSystemTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('sys-time').textContent = time;
}

// ==================== Event Listeners ====================
function initEventListeners() {
    // Activate button
    const activateBtn = document.getElementById('btn-activate');
    activateBtn.addEventListener('click', () => {
        if (IGRIS.isConnected) {
            if (IGRIS.isListening) {
                IGRIS.socket.emit('stop_listening');
            } else {
                IGRIS.socket.emit('start_listening');
            }
        } else {
            showResponse('Not connected to IGRIS backend. Please start the server.');
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('btn-reset');
    resetBtn.addEventListener('click', () => {
        if (IGRIS.isConnected) {
            IGRIS.socket.emit('reset_conversation');
            showResponse('Conversation reset.');
        }
    });
    
    // Text input
    const textInput = document.getElementById('text-input');
    const sendBtn = document.getElementById('btn-send');
    
    const sendTextInput = () => {
        const text = textInput.value.trim();
        if (text && IGRIS.isConnected) {
            IGRIS.socket.emit('text_input', { text: text });
            textInput.value = '';
        } else if (!IGRIS.isConnected) {
            showResponse('Not connected to IGRIS backend.');
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
            if (IGRIS.isListening) {
                IGRIS.socket.emit('stop_listening');
            }
        }
    });
}

// ==================== Audio Visualization ====================
function updateAudioLevel(level) {
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach((bar, i) => {
        const height = 5 + (level * 25) * (1 + Math.sin(Date.now() / 100 + i) * 0.5);
        bar.style.height = height + 'px';
    });
}

// Simulate audio levels when speaking
setInterval(() => {
    if (IGRIS.state === 'speaking') {
        const fakeLevel = 0.3 + Math.random() * 0.7;
        updateAudioLevel(fakeLevel);
    } else if (IGRIS.state === 'listening') {
        const fakeLevel = 0.1 + Math.random() * 0.3;
        updateAudioLevel(fakeLevel);
    } else {
        updateAudioLevel(0.1);
    }
}, 100);

console.log('[IGRIS]: Script loaded successfully');
