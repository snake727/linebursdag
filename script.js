/* === SCRIPT.JS — cinematic PixiJS + GSAP === */

// ====== PASSWORD SYSTEM ======
const PASSWORD_HASH = "38c69d88e8c0798840b4c4e3a69bec0e03b37329c97fdb9cf190bcffed22d4bf"; 
document.getElementById("enterBtn").addEventListener("click", checkPassword);
document.getElementById("password").addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkPassword();
});

async function hash(str) {
  const buffer = new TextEncoder().encode(str);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkPassword() {
  const input = document.getElementById("password").value;
  const error = document.getElementById("error");
  const hashed = await hash(input);

  if (hashed === PASSWORD_HASH) {
    error.classList.add("hidden");
    
    // Start audio when password is correct
    if (!audioPlaying) {
      audio.volume = 0;
      audio.play();
      gsap.to(audio, { volume: 0.3, duration: 2 });
      toggleBtn.textContent = "🔊";
      audioPlaying = true;
    }
    
    gsap.delayedCall(0.3, () => showSection("journey"));
  } else {
    error.classList.remove("hidden");
  }
}

// ====== AUDIO CONTROLS ======
const audio = document.getElementById("backgroundAudio");
const toggleBtn = document.getElementById("audioToggle");
let audioPlaying = false;

function toggleAudio() {
  if (!audioPlaying) {
    audio.volume = 0;
    audio.play();
    gsap.to(audio, { volume: 0.3, duration: 2 });
    toggleBtn.textContent = "�";
    audioPlaying = true;
  } else {
    gsap.to(audio, {
      volume: 0,
      duration: 1,
      onComplete: () => audio.pause()
    });
    toggleBtn.textContent = "🎵";
    audioPlaying = false;
  }
}

// ====== SECTION NAVIGATION ======
let currentSection = "welcome"; // Start with welcome
let isTransitioningSection = false;

function showSection(id) {
  const oldSection = document.getElementById(currentSection);
  const newSection = document.getElementById(id);

  if (!newSection || isTransitioningSection) return;
  
  isTransitioningSection = true;

  // Step 1: Fade out current section
  if (oldSection && oldSection !== newSection) {
    // Ensure we're starting from visible state
    gsap.set(oldSection, { opacity: 1 });
    
    gsap.to(oldSection, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        // Remove active class and hide the section
        oldSection.classList.remove("active");
        gsap.set(oldSection, { display: "none" });
        
        // Step 2: Gentle pause for particle transition
        setTimeout(() => {
          // Step 3: Start particle transition
          handleParticleTransition(id);
          
          // Step 4: Fade in new section after particle transition starts
          setTimeout(() => {
            // Prepare new section for fade in
            gsap.set(newSection, { 
              opacity: 0, 
              display: "block"
            });
            newSection.classList.add("active");
            
            gsap.to(newSection, {
              opacity: 1,
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                isTransitioningSection = false;
              }
            });
          }, 300); // Small delay for particle transition to begin
          
        }, 400); // Gentle pause between sections
      }
    });
  } else {
    // First section or same section - immediate switch
    gsap.set(newSection, { opacity: 1, display: "block" });
    newSection.classList.add("active");
    currentSection = id;
    updateProgress(id);
    isTransitioningSection = false;
    return;
  }
  
  currentSection = id;
  updateProgress(id);
}

// ====== PROGRESS BAR ======
const progressMap = [
  "journey",
  "first-moments",
  "growing-together",
  "what-i-love",
  "our-future",
  "birthday-message"
];

function updateProgress(id) {
  const fill = document.getElementById("progress-fill");
  const index = progressMap.indexOf(id);
  const progress = index >= 0 ? ((index + 1) / progressMap.length) * 100 : 0;
  gsap.to(fill, { width: `${progress}%`, duration: 0.5, ease: "power2.out" });
}

// ====== THREE.JS TRANSITION SYSTEM ======
let scene, camera, renderer, currentTransition = null;
let isTransitioning = false;

function initThreeJS() {
  if (renderer) return;
  
  console.log("Initializing Three.js...");
  
  try {
    const canvas = document.getElementById("animationCanvas");
    if (!canvas) {
      console.warn("Animation canvas not found, skipping Three.js");
      return;
    }
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    camera.position.z = 5;
    
    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start render loop
    renderLoop();
    console.log("Three.js initialized successfully");
    
  } catch (error) {
    console.error("Three.js initialization failed:", error);
  }
}

// Global animated texture for birds (shared across all bird sprites)
let birdAnimatedTexture = null;

function getOrCreateBirdTexture() {
  if (!birdAnimatedTexture) {
    console.log("Creating bird texture from MP4...");
    
    // Create video element for the MP4
    const video = document.createElement('video');
    video.src = './birdflying.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    
    // Create canvas to process the video and remove background
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    
    // Create Three.js texture from processed canvas
    birdAnimatedTexture = new THREE.CanvasTexture(canvas);
    birdAnimatedTexture.minFilter = THREE.LinearFilter;
    birdAnimatedTexture.magFilter = THREE.LinearFilter;
    
    // Process video frames to match background
    const processFrame = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data to process background
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Process pixels to remove/replace background color
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Detect white/light background pixels and make them transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Make transparent
          }
          // Or replace with your app's background color (#faf9f6)
          else if (r > 200 && g > 200 && b > 200) {
            data[i] = 250;     // R
            data[i + 1] = 249; // G  
            data[i + 2] = 246; // B (#faf9f6)
          }
          // Add color tinting to the bird pixels (non-background)
          else if (data[i + 3] > 0) { // Only tint visible pixels
            // You can change these values to tint the birds different colors:
            // For darker/more dramatic birds, reduce RGB values
            // For golden birds: multiply by (1.2, 1.1, 0.8)
            // For blue birds: multiply by (0.7, 0.9, 1.3)
            // For red birds: multiply by (1.3, 0.7, 0.7)
            // Current: slight golden tint
            data[i] = Math.min(255, data[i] * 1.1);     // Slightly enhance red
            data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Slightly enhance green
            data[i + 2] = Math.min(255, data[i + 2] * 0.9);  // Slightly reduce blue for warm tone
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        birdAnimatedTexture.needsUpdate = true;
      }
      requestAnimationFrame(processFrame);
    };
    
    // Start playing the video
    video.addEventListener('loadeddata', () => {
      console.log("Bird video loaded successfully");
      video.play().then(() => {
        processFrame(); // Start processing frames
      }).catch(e => console.log("Video autoplay blocked, but will work on user interaction"));
    });
    
    video.addEventListener('error', (e) => {
      console.error("Failed to load bird video:", e);
    });
  }
  
  return birdAnimatedTexture;
}

function createEmojiTexture(emoji) {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  ctx.font = `${size * 0.8}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Unique transition animations
const transitionAnimations = {
  'journey': {
    emoji: '🕊️',
    name: 'Flying Birds',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Create massive bird coverage across entire screen with diagonal flight
        const verticalSpread = 25; // Much larger vertical spread for full coverage
        const horizontalSpread = 12; // Much larger horizontal spread
        
        // Better distribution system for 720 birds with full screen coverage
        const seed = i * 0.12345; // Unique seed for each bird
        const totalBirds = particles.length || 720; // Use actual count
        const birdsPerRow = Math.ceil(Math.sqrt(totalBirds * 0.8)); // Wider distribution
        const birdRow = Math.floor(i / birdsPerRow) + (Math.sin(seed * 7.3) * 4); // Extended row distribution
        const birdCol = (i % birdsPerRow) + (Math.cos(seed * 5.1) * 3); // Extended column distribution
        
        // Individual timing instead of wave delays
        const individualDelay = (Math.sin(seed * 6.7) + 1) * 0.25; // Tighter timing range for more cohesion
        
        // Add individual speed variations - some birds fly slower for natural effect
        const flightSpeed = 0.5 + (Math.cos(seed * 4.8) + 1) * 0.25; // Range: 0.5 to 1.0 (no faster than current)
        
        // Diagonal flight from top-left to bottom-right, covering entire screen
        const spacingX = 0.5; // Reduced spacing for much denser coverage
        const spacingY = 0.4; // Reduced vertical spacing for denser packing
        
        // Starting positions: Spread across entire screen area but shifted top-left
        const screenStartX = -10 + (birdCol * spacingX) + (Math.sin(seed * 4.2) * 6); // Tighter spread
        const screenStartY = 15 - (birdRow * spacingY) + (Math.cos(seed * 3.8) * 3); // Tighter spread
        
        // Add diagonal offset to create top-left to bottom-right movement
        const diagonalOffset = (birdRow + birdCol) * 0.3; // Creates diagonal wave effect
        const startX = screenStartX - diagonalOffset; // Top-left bias
        const startY = screenStartY + diagonalOffset; // Top-left bias
        
        // Ending positions: Diagonal movement to bottom-right while covering screen
        const endX = screenStartX + diagonalOffset + 25; // Bottom-right movement
        const endY = screenStartY - diagonalOffset - 20; // Bottom-right movement
        
        // Individual timing for natural effect with speed variations
        const flightProgress = reverse ? (1 - progress) : progress;
        const adjustedProgress = Math.max(0, (flightProgress - individualDelay) * flightSpeed);
        
        particle.position.x = (startX + (endX - startX) * adjustedProgress) * direction;
        particle.position.y = startY + (endY - startY) * adjustedProgress;
        
        // More varied wing beats for individual behavior
        const wingBeatFreq = 5 + (Math.sin(seed * 8.4) * 2); // Reduced wing beat variation
        const wingBeat = Math.sin(adjustedProgress * Math.PI * wingBeatFreq + seed * 10) * 0.2;
        particle.position.y += wingBeat;
        
        // Reduced drift for more cohesive directional movement
        const primaryDrift = Math.sin(adjustedProgress * Math.PI * 2 + seed * 5) * 0.5; // Reduced drift
        const secondaryDrift = Math.cos(adjustedProgress * Math.PI * 1.5 + seed * 3) * 0.2; // Reduced drift
        particle.position.x += primaryDrift + secondaryDrift;
        
        // Individual depth for 3D effect
        particle.position.z = Math.sin(seed * 4 + adjustedProgress * Math.PI) * 1.2;
        
        // Individual rotation for more natural movement
        particle.rotation.z = Math.sin(adjustedProgress * Math.PI * 1.8 + seed * 6) * 0.2;
        
        // Individual opacity for natural effect
        if (adjustedProgress > 0) {
          // Individual density variation instead of wave peaks
          const individualDensity = Math.sin(progress * Math.PI + seed * 4) * 0.3 + 0.7;
          particle.material.opacity = Math.sin(progress * Math.PI) * individualDensity;
        } else {
          particle.material.opacity = 0;
        }
      });
    }
  },
  
  'first-moments': {
    emoji: '🌸',
    name: 'Falling Petals',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Petals fall slowly, caught in gentle wind
        const windStrength = 1.5;
        const fallSpeed = 8;
        
        // Starting positions across the top
        const startX = (i % 20 - 10) * 0.8;
        const startY = 8;
        
        const timeOffset = (i % 10) * 0.1; // Stagger the falling
        const adjustedProgress = Math.max(0, progress - timeOffset);
        
        // Wind creates horizontal drift - multiple wind layers
        const wind1 = Math.sin(adjustedProgress * Math.PI * 3 + i * 0.3) * windStrength;
        const wind2 = Math.cos(adjustedProgress * Math.PI * 2 + i * 0.7) * windStrength * 0.5;
        
        particle.position.x = startX + wind1 + wind2;
        particle.position.y = (startY - adjustedProgress * fallSpeed) * direction;
        
        // Slight depth movement
        particle.position.z = Math.sin(adjustedProgress * Math.PI * 4 + i) * 0.4;
        
        // Gentle tumbling rotation
        particle.rotation.z = adjustedProgress * Math.PI * 3 + i * 0.5;
        
        // Fade based on fall progress
        particle.material.opacity = adjustedProgress > 0 ? Math.sin(progress * Math.PI) * 0.8 : 0;
      });
    }
  },
  
  'growing-together': {
    emoji: '🍂',
    name: 'Autumn Leaves in Wind',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Leaves fall with complex wind patterns
        const windCycle1 = Math.sin(progress * Math.PI * 2 + i * 0.4) * 2;
        const windCycle2 = Math.cos(progress * Math.PI * 1.5 + i * 0.8) * 1.5;
        const gusty = Math.sin(progress * Math.PI * 6 + i) * 0.8;
        
        // Start from various positions across top
        const startX = (i % 15 - 7) * 1.2;
        const fallProgress = progress + (i % 10) * 0.05;
        
        particle.position.x = startX + windCycle1 + windCycle2 + gusty;
        particle.position.y = (6 - fallProgress * 10) * direction;
        
        // Tumbling motion as leaves fall
        particle.position.z = Math.sin(fallProgress * Math.PI * 3 + i * 0.6) * 0.5;
        particle.rotation.z = fallProgress * Math.PI * 4 + i;
        
        // Natural fade
        particle.material.opacity = Math.sin(progress * Math.PI) * 0.85;
      });
    }
  },
  
  'what-i-love': {
    emoji: '💖',
    name: 'Heart Shower',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Hearts fall like gentle rain with occasional flutter
        const timeOffset = (i % 20) * 0.03; // Slight stagger
        const adjustedProgress = Math.max(0, progress - timeOffset);
        
        // Starting positions in a wide spread
        const startX = (i % 25 - 12) * 0.7;
        const startY = 8 + (i % 5) * 0.4;
        
        // Gentle swaying motion like hearts floating down
        const sway = Math.sin(adjustedProgress * Math.PI * 2.5 + i * 0.6) * 1.2;
        const flutter = Math.sin(adjustedProgress * Math.PI * 8 + i) * 0.3;
        
        particle.position.x = startX + sway;
        particle.position.y = (startY - adjustedProgress * 6) * direction;
        particle.position.z = flutter;
        
        // Gentle spinning
        particle.rotation.z = adjustedProgress * Math.PI * 2 + i * 0.3;
        
        // Pulsing opacity like heartbeat
        const heartbeat = Math.sin(adjustedProgress * Math.PI * 12) * 0.2 + 0.8;
        particle.material.opacity = adjustedProgress > 0 ? Math.sin(progress * Math.PI) * heartbeat : 0;
      });
    }
  },
  
  'our-future': {
    emoji: '✨',
    name: 'Shooting Stars',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Stars streak diagonally from top-right to bottom-left
        const streakAngle = -0.3; // Slight tilt
        const speed = 12;
        const delay = (i % 15) * 0.04; // Stagger the streaks
        
        const adjustedProgress = Math.max(0, progress - delay);
        
        if (adjustedProgress > 0) {
          // Starting position (top-right area)
          const startX = 6 + (i % 8) * 0.5;
          const startY = 5 + (i % 5) * 0.8;
          
          // Calculate streak path
          const distance = adjustedProgress * speed;
          particle.position.x = (startX - distance * Math.cos(streakAngle)) * direction;
          particle.position.y = (startY - distance * Math.sin(streakAngle)) * direction;
          particle.position.z = (i % 7 - 3) * 0.3;
          
          // Shooting star rotation
          particle.rotation.z = streakAngle + Math.sin(adjustedProgress * Math.PI * 10) * 0.1;
          
          // Quick fade in, then fade out as it streaks
          const fadeIn = Math.min(adjustedProgress * 10, 1);
          const fadeOut = Math.max(0, 1 - (adjustedProgress - 0.7) * 3);
          particle.material.opacity = fadeIn * fadeOut * 0.9;
        } else {
          particle.material.opacity = 0;
        }
      });
    }
  },
  
  'birthday-message': {
    emoji: '🦋',
    name: 'Butterfly Garden',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        // Butterflies flutter naturally across the screen
        const flutterSpeed = 2 + (i % 3) * 0.5;
        const flutterHeight = 1 + (i % 4) * 0.3;
        
        // Each butterfly has its own path timing
        const pathProgress = (progress + (i % 10) * 0.1) % 1;
        
        // Natural butterfly flight path - curved and organic
        const baseX = -6 + pathProgress * 12;
        const flutter = Math.sin(pathProgress * Math.PI * flutterSpeed) * flutterHeight;
        const drift = Math.cos(pathProgress * Math.PI * 1.3) * 0.8;
        
        particle.position.x = (baseX + drift) * direction;
        particle.position.y = flutter + Math.sin(i * 0.8) * 2;
        particle.position.z = Math.sin(pathProgress * Math.PI * 3 + i) * 0.4;
        
        // Wing flapping rotation
        particle.rotation.z = Math.sin(pathProgress * Math.PI * 16 + i) * 0.2;
        
        // Gentle fade as they cross the screen
        particle.material.opacity = Math.sin(progress * Math.PI) * 0.8;
      });
    }
  }
};

function playTransition(sectionId, reverse = false, onComplete = null) {
  if (isTransitioning) return;
  
  const transition = transitionAnimations[sectionId];
  if (!transition) return;
  
  isTransitioning = true;
  
  // Clear existing particles
  while(scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  
  // Create particles for this transition
  const particles = [];
  const particleCount = sectionId === 'journey' ? 1200 : 60; // Maximum bird density for ultra dense flock
  
  for (let i = 0; i < particleCount; i++) {
    let texture;
    
    // Use shared animated GIF texture for birds, emoji for others
    if (sectionId === 'journey') {
      texture = getOrCreateBirdTexture();
    } else {
      texture = createEmojiTexture(transition.emoji);
    }
    
    const material = new THREE.SpriteMaterial({ 
      map: texture, 
      transparent: true,
      opacity: 0,
      alphaTest: 0.1 // This helps remove background pixels
    });
    
    const sprite = new THREE.Sprite(material);
    
    // Make birds slightly larger since they're more detailed with size variations
    if (sectionId === 'journey') {
      // Add size variation for more natural flock appearance
      const sizeSeed = i * 0.12345; // Same seed used in animation for consistency
      const sizeVariation = 0.4 + (Math.sin(sizeSeed * 7.8) + 1) * 0.3; // Range: 0.4 to 1.0
      sprite.scale.set(sizeVariation, sizeVariation, 1);
    } else {
      sprite.scale.set(0.4, 0.4, 1);
    }
    
    particles.push(sprite);
    scene.add(sprite);
  }
  
  // Animate transition
  const duration = 5.5; // Even slower for very peaceful bird flight
  let startTime = Date.now();
  
  const animate = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);
    
    // Run the specific animation for this transition
    transition.animate(particles, progress, reverse);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Transition complete - clean up
      particles.forEach(particle => {
        scene.remove(particle);
      });
      isTransitioning = false;
      if (onComplete) onComplete();
    }
  };
  
  animate();
}

function renderLoop() {
  requestAnimationFrame(renderLoop);
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Modified section navigation to include transitions
let previousSection = 'welcome'; // Start with welcome so journey transition works

function handleParticleTransition(id) {
  // Always play transition for the first journey section
  if (id === 'journey' && previousSection === 'welcome') {
    playTransition(id, false);
    previousSection = id;
    return;
  }
  
  // Only play transition if moving to a different section
  if (id === previousSection) return;
  
  // Determine if going forward or backward
  const sectionOrder = ['journey', 'first-moments', 'growing-together', 'what-i-love', 'our-future', 'birthday-message'];
  const currentIndex = sectionOrder.indexOf(id);
  const previousIndex = sectionOrder.indexOf(previousSection);
  const reverse = currentIndex < previousIndex;
  
  // Play the transition for the section we're going TO
  playTransition(id, reverse);
  
  previousSection = id;
}

function initPixi() {
  // Replaced with Three.js - redirect to new system
  initThreeJS();
}

function createParticleBatch(container, type) {
  // Redirect to Three.js system
  spawnParticles(type);
}

function spawnPixiParticles(type) {
  // Redirect to Three.js system
  spawnParticles(type);
}

// ====== INITIALIZE ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing website...");
  
  // Initialize Three.js (optional - website works without it)
  try {
    initPixi();
  } catch (error) {
    console.warn("Three.js initialization failed, but website will continue:", error);
  }
  
  // Properly initialize the welcome section with GSAP
  const welcomeSection = document.getElementById("welcome");
  if (welcomeSection) {
    console.log("Setting up welcome section");
    gsap.set(welcomeSection, { 
      opacity: 1, 
      display: "block" 
    });
    welcomeSection.classList.add("active");
    console.log("Welcome section initialized");
  } else {
    console.error("Welcome section not found!");
  }
});
