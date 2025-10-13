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
        
        // Responsive screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const margin = Math.min(screenWidth, screenHeight) * 0.08; // 8% margin for safety
        
        // Grid-based starting positions with screen responsiveness
        const gridX = (birdCol / (birdsPerRow - 1)) + (Math.sin(seed * 4.2) * 0.2 - 0.1); // Normalized 0-1 with variation
        const gridY = (birdRow / (birdsPerRow - 1)) + (Math.cos(seed * 3.8) * 0.15 - 0.075); // Normalized 0-1 with variation
        
        // Convert to Three.js coordinates starting from top-left area
        const startScreenX = gridX * (screenWidth - margin * 2) + margin - screenWidth * 0.3; // Start left of screen
        const startScreenY = (1 - gridY) * (screenHeight - margin * 2) + margin + screenHeight * 0.2; // Start above screen
        const startX = (startScreenX - screenWidth / 2) / 100; // Convert to Three.js coordinates
        const startY = (startScreenY - screenHeight / 2) / 100;
        
        // Ending positions: Diagonal movement to bottom-right
        const endScreenX = startScreenX + screenWidth * 0.8; // Move across and off screen
        const endScreenY = startScreenY - screenHeight * 0.8; // Move down and off screen
        const endX = (endScreenX - screenWidth / 2) / 100;
        const endY = (endScreenY - screenHeight / 2) / 100;
        
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
        // Create 8 unique falling patterns for variety
        const patternType = i % 8;
        const seed = i * 0.12345;
        
        // Much slower, gentle falling for longer visibility
        const baseFallSpeed = 2.5 + (Math.sin(seed * 5.2) * 1.5); // Adjusted: 1-4 fall speed
        const timeOffset = (i % 50) * 0.008; // Reduced stagger: max 0.4 seconds delay
        const adjustedProgress = Math.max(0, progress - timeOffset);
        
        // Responsive starting positions spread across entire screen width
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const margin = Math.min(screenWidth, screenHeight) * 0.08; // 8% margin for safety
        
        // Distribute flowers across the full width of the screen
        const normalizedX = (i % 40) / 39; // 0 to 1 across width
        const screenStartX = normalizedX * (screenWidth - margin * 2) + margin;
        const startX = (screenStartX - screenWidth / 2) / 100; // Convert to Three.js coordinates
        const startY = (screenHeight * 0.6) / 100; // Start above screen, responsive to height
        
        let finalX, finalY, rotation, windX, windY;
        
        // Pattern 0: Gentle S-curve fall
        if (patternType === 0) {
          windX = Math.sin(adjustedProgress * Math.PI * 2 + seed * 6) * 2.5;
          windY = Math.cos(adjustedProgress * Math.PI * 1.5 + seed * 4) * 0.8;
          rotation = adjustedProgress * Math.PI * 2 + seed * 3;
        }
        // Pattern 1: Spiral descent
        else if (patternType === 1) {
          const spiralRadius = 1.5 + Math.sin(seed * 7) * 0.8;
          windX = Math.sin(adjustedProgress * Math.PI * 4 + seed * 8) * spiralRadius;
          windY = Math.cos(adjustedProgress * Math.PI * 4 + seed * 8) * 0.5;
          rotation = adjustedProgress * Math.PI * 4 + seed * 5;
        }
        // Pattern 2: Zigzag fall
        else if (patternType === 2) {
          windX = Math.sin(adjustedProgress * Math.PI * 6 + seed * 9) * 1.8;
          windY = Math.sin(adjustedProgress * Math.PI * 3 + seed * 2) * 0.6;
          rotation = adjustedProgress * Math.PI * 1.5 + seed * 7;
        }
        // Pattern 3: Lazy drift
        else if (patternType === 3) {
          windX = Math.sin(adjustedProgress * Math.PI * 1.5 + seed * 4) * 3.0;
          windY = Math.cos(adjustedProgress * Math.PI * 0.8 + seed * 6) * 0.4;
          rotation = adjustedProgress * Math.PI * 1.2 + seed * 2;
        }
        // Pattern 4: Flutter fall
        else if (patternType === 4) {
          windX = Math.sin(adjustedProgress * Math.PI * 8 + seed * 12) * 1.2;
          windY = Math.sin(adjustedProgress * Math.PI * 10 + seed * 8) * 0.7;
          rotation = adjustedProgress * Math.PI * 6 + seed * 9;
        }
        // Pattern 5: Wide pendulum
        else if (patternType === 5) {
          windX = Math.sin(adjustedProgress * Math.PI * 1.2 + seed * 5) * 4.0;
          windY = Math.cos(adjustedProgress * Math.PI * 2.5 + seed * 3) * 0.5;
          rotation = adjustedProgress * Math.PI * 0.8 + seed * 4;
        }
        // Pattern 6: Gentle curve with rotation bursts
        else if (patternType === 6) {
          windX = Math.sin(adjustedProgress * Math.PI * 2.5 + seed * 7) * 2.2;
          windY = Math.cos(adjustedProgress * Math.PI * 1.8 + seed * 5) * 0.9;
          rotation = adjustedProgress * Math.PI * 3.5 + Math.sin(adjustedProgress * Math.PI * 12) * 0.5;
        }
        // Pattern 7: Chaotic gentle fall
        else {
          windX = Math.sin(adjustedProgress * Math.PI * 3.2 + seed * 15) * 1.8 + 
                  Math.cos(adjustedProgress * Math.PI * 1.7 + seed * 11) * 1.2;
          windY = Math.sin(adjustedProgress * Math.PI * 2.8 + seed * 9) * 0.6;
          rotation = adjustedProgress * Math.PI * 2.5 + seed * 6;
        }
        
        // Apply positions with gentle movements - fall from top to bottom of screen (responsive)
        const fallDistance = (screenHeight + margin * 2) / 100; // Fall distance based on screen height
        finalX = startX + windX;
        finalY = startY - (adjustedProgress * fallDistance); // Responsive fall distance
        
        particle.position.x = finalX * direction;
        particle.position.y = finalY;
        
        // Add depth variation for 3D effect
        particle.position.z = Math.sin(adjustedProgress * Math.PI * 2 + seed * 4) * 1.0;
        
        // Continuous gentle rotation
        particle.rotation.z = rotation;
        
        // Add size variations for natural diversity
        const baseSize = 0.3 + (Math.sin(seed * 8.7) + 1) * 0.35; // Range: 0.3 to 1.0
        const sizeVariation = Math.sin(adjustedProgress * Math.PI * 3 + seed * 12) * 0.1; // Subtle pulsing
        const finalSize = baseSize + sizeVariation;
        particle.scale.set(finalSize, finalSize, 1);
        
        // Visible throughout the journey - only hide when off-screen
        if (adjustedProgress > 0 && finalY > -15) {
          particle.material.opacity = 0.9; // Strong opacity for visibility
        } else {
          particle.material.opacity = 0;
        }
      });
    }
  },
  
  'growing-together': {
    emoji: '🍂',
    name: 'Autumn Leaves in Wind',
    animate: (particles, progress, reverse = false) => {
      const direction = reverse ? -1 : 1;
      particles.forEach((particle, i) => {
        const seed = i * 0.12345;
        const timeOffset = (i % 40) * 0.02; // More staggered timing
        const adjustedProgress = Math.max(0, progress - timeOffset);
        
        // Responsive starting positions from various positions across top - like falling from tree branches
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const margin = Math.min(screenWidth, screenHeight) * 0.08; // 8% margin for safety
        
        // Distribute leaves across the tree canopy (full width)
        const normalizedX = (i % 30) / 29; // 0 to 1 across width
        const screenStartX = normalizedX * (screenWidth - margin * 2) + margin;
        const startX = (screenStartX - screenWidth / 2) / 100; // Convert to Three.js coordinates
        const startY = (screenHeight * 0.5 + Math.sin(seed * 4.1) * (screenHeight * 0.1)) / 100; // Start above screen with variation
        
        // Determine leaf behavior: 80% gentle fall, 20% caught by wind
        const isWindCaught = (i % 5 === 0); // Every 5th leaf gets caught by wind
        const windCatchPoint = 0.3 + (Math.sin(seed * 6.2) * 0.2); // Wind catches them 30-50% through fall
        
        let finalX, finalY;
        
        if (isWindCaught && adjustedProgress > windCatchPoint) {
          // Wind-caught behavior - starts after falling partway down
          const windStartProgress = (adjustedProgress - windCatchPoint) / (1 - windCatchPoint);
          const gentleFallProgress = windCatchPoint;
          
          // Initial gentle fall to wind catch point (responsive)
          const initialFallDistance = (screenHeight * 0.35) / 100; // 35% of screen height for initial fall
          const gentleFallY = startY - (gentleFallProgress * initialFallDistance);
          const gentleSwayX = Math.sin(gentleFallProgress * Math.PI * 1.5 + seed * 4) * 1.0;
          
          // Wind sweeps leaf to the right off screen
          const windSpeed = 12 + (Math.sin(seed * 5.2) * 6); // Strong rightward wind speed
          const windAcceleration = windStartProgress * windStartProgress; // Accelerating wind effect
          const minorBobbing = Math.sin(windStartProgress * Math.PI * 4 + seed * 8) * 0.4; // Minimal bobbing
          
          // Responsive continued fall distance
          const continuedFallDistance = (screenHeight * 0.4) / 100; // 40% of screen height for continued fall
          finalX = startX + gentleSwayX + (windStartProgress * windSpeed * windAcceleration);
          finalY = gentleFallY - (windStartProgress * continuedFallDistance) + minorBobbing;
        } else {
          // Gentle natural fall (80% of leaves) - responsive distance
          const gentleSway = Math.sin(adjustedProgress * Math.PI * 1.8 + seed * 6) * 1.2;
          const naturalDrift = Math.cos(adjustedProgress * Math.PI * 1.2 + seed * 8) * 0.8;
          const leafWobble = Math.sin(adjustedProgress * Math.PI * 4 + seed * 12) * 0.3;
          
          // Responsive natural fall distance based on screen height
          const naturalFallDistance = (screenHeight * 0.8) / 100; // 80% of screen height
          finalX = startX + gentleSway + naturalDrift + leafWobble;
          finalY = startY - (adjustedProgress * naturalFallDistance);
        }
        
        particle.position.x = finalX * direction;
        particle.position.y = finalY;
        
        // Realistic tumbling - faster for wind-caught leaves
        const tumbleSpeed = isWindCaught ? 4 + (Math.sin(seed * 7) * 2) : 2 + (Math.sin(seed * 9) * 1);
        particle.rotation.z = adjustedProgress * Math.PI * tumbleSpeed + seed * 8;
        
        // Enhanced 3D movement
        particle.position.z = Math.sin(adjustedProgress * Math.PI * 2.5 + seed * 6) * 0.6;
        
        // Smaller leaves with size variations
        const leafSize = 0.3 + (Math.sin(seed * 11.3) + 1) * 0.25; // Range: 0.3 to 0.8 (smaller)
        const sizeFlutter = Math.sin(adjustedProgress * Math.PI * 8 + seed * 14) * 0.05; // Slight size flutter
        particle.scale.set(leafSize + sizeFlutter, leafSize + sizeFlutter, 1);
        
        // Natural opacity with wind flicker for caught leaves
        if (adjustedProgress > 0) {
          let baseOpacity = Math.sin(progress * Math.PI) * 0.85;
          if (isWindCaught && adjustedProgress > windCatchPoint) {
            const windFlicker = Math.sin(adjustedProgress * Math.PI * 12 + seed * 16) * 0.15;
            baseOpacity += windFlicker;
          }
          particle.material.opacity = Math.max(0, Math.min(1, baseOpacity));
        } else {
          particle.material.opacity = 0;
        }
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
      
      // Responsive screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const margin = Math.min(screenWidth, screenHeight) * 0.08; // 8% margin for safety
      
      particles.forEach((particle, i) => {
        const seed = i * 0.31415; // Unique seed for each star
        
        // More spaced out timing - stars spawn throughout the full animation
        const spawnTime = (i / particles.length) * 0.7; // Spread stars across 70% of animation
        const starDuration = 0.4; // Much faster - each star takes 400ms to cross screen
        const trailDuration = 0.6; // Longer trail duration for visibility
        
        // Calculate if this star should be active
        const starStartTime = spawnTime;
        const starEndTime = Math.min(1.0, starStartTime + starDuration + trailDuration);
        
        if (progress < starStartTime || progress > starEndTime) {
          // Star not active yet or already finished
          particle.material.opacity = 0;
          return;
        }
        
        // Calculate phase within star's lifecycle
        const starProgress = (progress - starStartTime) / (starEndTime - starStartTime);
        
        // Better spacing - distribute stars across wider areas
        const starsPerRow = Math.ceil(Math.sqrt(particles.length) * 0.7); // Fewer per row for more spacing
        const row = Math.floor(i / starsPerRow);
        const col = i % starsPerRow;
        
        // Starting positions spread across top-right area with better spacing
        const baseStartX = 0.6 + (col / Math.max(1, starsPerRow - 1)) * 0.35 + (Math.sin(seed * 5.2) * 0.05); // Wider right side
        const baseStartY = 0.05 + (row / Math.max(1, Math.ceil(particles.length / starsPerRow) - 1)) * 0.4 + (Math.cos(seed * 3.8) * 0.03); // Taller top area
        
        // Convert to screen coordinates
        const startScreenX = baseStartX * (screenWidth - margin * 2) + margin;
        const startScreenY = baseStartY * (screenHeight - margin * 2) + margin;
        const startX = (startScreenX - screenWidth / 2) / 100;
        const startY = (startScreenY - screenHeight / 2) / 100;
        
        // Diagonal path to bottom-left with wider spread
        const endScreenX = (0.02 + Math.sin(seed * 6.1) * 0.15) * (screenWidth - margin * 2) + margin; // Wider bottom-left area
        const endScreenY = (0.75 + Math.cos(seed * 4.3) * 0.15) * (screenHeight - margin * 2) + margin; // Taller bottom area
        const endX = (endScreenX - screenWidth / 2) / 100;
        const endY = (endScreenY - screenHeight / 2) / 100;
        
        if (starProgress < starDuration / (starEndTime - starStartTime)) {
          // Active shooting phase - star is moving
          const shootProgress = starProgress / (starDuration / (starEndTime - starStartTime));
          
          // Much faster acceleration curve
          const accelerationCurve = shootProgress * shootProgress * shootProgress; // Cubic acceleration for more speed
          
          // Calculate current position along path
          const currentX = startX + (endX - startX) * accelerationCurve;
          const currentY = startY + (endY - startY) * accelerationCurve;
          
          particle.position.x = currentX * direction;
          particle.position.y = currentY;
          particle.position.z = (Math.sin(seed * 7.2) * 0.3); // Slight depth variation
          
          // Rotate star to align with movement direction
          const movementAngle = Math.atan2(endY - startY, endX - startX);
          particle.rotation.z = movementAngle + Math.sin(shootProgress * Math.PI * 12) * 0.05; // Slight wobble
          
          // Larger size as star accelerates (more dramatic effect)
          const baseSize = 0.5 + (Math.sin(seed * 9.1) * 0.3);
          const speedSize = 1 + (accelerationCurve * 1.0); // Gets much bigger as it speeds up
          particle.scale.setScalar(baseSize * speedSize);
          
          // Very bright during shooting phase
          const flicker = Math.sin(shootProgress * Math.PI * 25 + seed * 12) * 0.15 + 0.85;
          particle.material.opacity = flicker;
          
        } else {
          // Trail fade phase - create visible stardust trail
          const trailProgress = (starProgress - starDuration / (starEndTime - starStartTime)) / (trailDuration / (starEndTime - starStartTime));
          
          // Position trail particles along the path
          const trailPosition = 1 - (trailProgress * 0.7); // Trail follows 70% of the path backwards
          const trailX = startX + (endX - startX) * trailPosition;
          const trailY = startY + (endY - startY) * trailPosition;
          
          particle.position.x = trailX * direction;
          particle.position.y = trailY;
          particle.position.z = (Math.sin(seed * 7.2) * 0.2); // Slight depth variation
          
          // Trail particles get smaller and fade
          const trailOpacity = (1 - trailProgress) * 0.6; // More visible trail
          particle.material.opacity = Math.max(0, trailOpacity);
          
          // Smaller, sparkling trail particles
          const trailSize = 0.2 + (1 - trailProgress) * 0.3;
          particle.scale.setScalar(trailSize);
          
          // Gentle rotation for sparkle effect
          particle.rotation.z = (progress * Math.PI * 3 + seed * 8) * (1 - trailProgress);
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
  },

  'what-i-love': {
    emoji: '💖',
    name: 'Heartbeat',
    animate: (particles, progress, reverse = false) => {
      particles.forEach((particle, i) => {
        const seed = i * 0.27183; // Unique seed for each heart
        
        // Different heart types for variety
        const heartTypes = ['💖', '💕', '💗', '💝', '💞', '💓', '❤️', '🧡', '💛', '💚', '💙', '💜'];
        const heartType = heartTypes[i % heartTypes.length];
        
        // Update the particle material with the heart type
        if (particle.material && particle.material.map && particle.material.map.image) {
          const canvas = particle.material.map.image;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = `${canvas.width * 0.8}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(heartType, canvas.width / 2, canvas.height / 2);
          particle.material.map.needsUpdate = true;
        }
        
        // Grid-based distribution with randomization for better coverage
        const heartsPerRow = Math.ceil(Math.sqrt(particles.length));
        const row = Math.floor(i / heartsPerRow);
        const col = i % heartsPerRow;
        
        // Base grid position with randomization
        const baseX = (col / (heartsPerRow - 1)) + (Math.sin(seed * 7.2) * 0.15 - 0.075); // Add some randomness
        const baseY = (row / (heartsPerRow - 1)) + (Math.cos(seed * 5.8) * 0.15 - 0.075); // Add some randomness
        
        // Clamp to ensure hearts stay within bounds
        const normalizedX = Math.max(0.05, Math.min(0.95, baseX));
        const normalizedY = Math.max(0.05, Math.min(0.95, baseY));
        
        // Convert to screen coordinates with proper margins
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const margin = Math.min(screenWidth, screenHeight) * 0.08; // 8% margin for safety
        
        const screenX = (normalizedX * (screenWidth - margin * 2) + margin - screenWidth / 2) / 100; // Convert to Three.js coordinates
        const screenY = ((1 - normalizedY) * (screenHeight - margin * 2) + margin - screenHeight / 2) / 100; // Convert to Three.js coordinates, flip Y
        
        // Hearts appear at different times throughout the 8-second animation
        const appearTime = (Math.sin(seed * 4.1) + 1) * 0.5; // 0 to 1, when heart appears
        const fadeInDuration = 0.15; // 150ms fade in
        const pumpDuration = 0.8; // 800ms of pumping
        const fadeOutDuration = 0.2; // 200ms fade out
        
        // Calculate if this heart should be visible
        const heartStartTime = appearTime;
        const heartEndTime = Math.min(1.0, heartStartTime + fadeInDuration + pumpDuration + fadeOutDuration);
        
        if (progress < heartStartTime || progress > heartEndTime) {
          // Heart not active yet or already finished
          particle.scale.setScalar(0);
          particle.material.opacity = 0;
          return;
        }
        
        // Calculate phase within heart's lifecycle
        const heartProgress = (progress - heartStartTime) / (heartEndTime - heartStartTime);
        
        let scale = 1.0;
        let opacity = 0;
        
        if (heartProgress < fadeInDuration / (heartEndTime - heartStartTime)) {
          // Fade in phase - heart pops in
          const fadeInProgress = heartProgress / (fadeInDuration / (heartEndTime - heartStartTime));
          scale = 0.3 + (fadeInProgress * 0.7); // Pop from 30% to 100%
          opacity = fadeInProgress * 0.9;
        } else if (heartProgress < (fadeInDuration + pumpDuration) / (heartEndTime - heartStartTime)) {
          // Pumping phase - heartbeat animation
          const pumpProgress = (heartProgress - fadeInDuration / (heartEndTime - heartStartTime)) / (pumpDuration / (heartEndTime - heartStartTime));
          
          // Heartbeat pattern: larger beat, smaller beat, pause
          const beatCycle = (pumpProgress * 6) % 3; // 3 phases per cycle, 2 cycles over pump duration
          
          if (beatCycle < 0.4) {
            // First beat (larger)
            const beatPhase = beatCycle / 0.4;
            scale = 1.0 + Math.sin(beatPhase * Math.PI) * 0.4; // Pump to 140%
          } else if (beatCycle < 0.7) {
            // Second beat (smaller)
            const beatPhase = (beatCycle - 0.4) / 0.3;
            scale = 1.0 + Math.sin(beatPhase * Math.PI) * 0.2; // Pump to 120%
          } else {
            // Rest phase
            scale = 1.0;
          }
          
          opacity = 0.9;
        } else {
          // Fade out phase
          const fadeOutProgress = (heartProgress - (fadeInDuration + pumpDuration) / (heartEndTime - heartStartTime)) / (fadeOutDuration / (heartEndTime - heartStartTime));
          scale = 1.0 - (fadeOutProgress * 0.3); // Shrink slightly while fading
          opacity = 0.9 * (1 - fadeOutProgress);
        }
        
        // Apply transforms
        particle.position.x = screenX;
        particle.position.y = screenY;
        particle.scale.setScalar(scale * (0.8 + Math.sin(seed * 3.7) * 0.4)); // Size variation
        particle.material.opacity = opacity;
        
        // Gentle rotation
        particle.rotation.z = Math.sin(progress * Math.PI * 2 + seed * 8) * 0.1;
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
  const particleCount = sectionId === 'journey' ? 600 : (sectionId === 'first-moments' ? 500 : (sectionId === 'growing-together' ? 150 : (sectionId === 'what-i-love' ? 120 : 60))); // Reduced birds to 600 for better performance
  
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
  const duration = sectionId === 'first-moments' ? 9.0 : (sectionId === 'growing-together' ? 12.0 : (sectionId === 'what-i-love' ? 8.0 : 5.5)); // 8 seconds for heartbeat animation
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
