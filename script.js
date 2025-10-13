// SHA-256 hashing helper
async function hashMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Set this to the SHA-256 hash of your real password.
// Password is: 161103
const PASSWORD_HASH = "38c69d88e8c0798840b4c4e3a69bec0e03b37329c97fdb9cf190bcffed22d4bf";

// Section progression and progress tracking
const sections = ['welcome', 'journey', 'first-moments', 'growing-together', 'what-i-love', 'our-future', 'birthday-message'];
let currentSectionIndex = 0;

// Audio management
let backgroundAudio;
let isAudioPlaying = false;
let hasUserInteracted = false;

function initializeAudio() {
  backgroundAudio = document.getElementById('backgroundAudio');
  backgroundAudio.volume = 0.3; // Set comfortable volume
  backgroundAudio.muted = false; // Don't start muted
  
  // Handle audio loading
  backgroundAudio.addEventListener('loadeddata', () => {
    console.log('Audio loaded successfully');
  });
  
  backgroundAudio.addEventListener('error', (e) => {
    console.log('Audio failed to load:', e);
    // Hide audio controls if audio fails to load
    document.querySelector('.audio-controls').style.display = 'none';
  });
  
  // Handle audio play success
  backgroundAudio.addEventListener('play', () => {
    isAudioPlaying = true;
    updateAudioButton();
  });
  
  // Handle audio pause
  backgroundAudio.addEventListener('pause', () => {
    isAudioPlaying = false;
    updateAudioButton();
  });
}

function startAudioOnInteraction() {
  if (!hasUserInteracted && backgroundAudio) {
    backgroundAudio.play().then(() => {
      isAudioPlaying = true;
      hasUserInteracted = true;
      updateAudioButton();
      console.log('Audio started successfully');
    }).catch(e => {
      console.log('Audio play failed:', e);
    });
  }
}

function updateAudioButton() {
  const toggle = document.getElementById('audioToggle');
  if (isAudioPlaying) {
    toggle.textContent = '🎵';
    toggle.classList.remove('muted');
  } else {
    toggle.textContent = '🔇';
    toggle.classList.add('muted');
  }
}

function toggleAudio() {
  if (isAudioPlaying) {
    backgroundAudio.pause();
  } else {
    backgroundAudio.play().catch(e => {
      console.log('Audio play failed:', e);
    });
  }
  hasUserInteracted = true;
}

// Professional particle animations using GSAP with complex flowing paths
function createAutumnLeavesEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const leafEmojis = ['🍂', '🍁', '🌿'];

  for (let i = 0; i < 35; i++) {
    const leaf = document.createElement('div');
    leaf.innerHTML = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
    leaf.style.position = 'absolute';
    leaf.style.fontSize = `${Math.random() * 15 + 25}px`;
    leaf.style.opacity = 0.85;
    leaf.style.pointerEvents = 'none';
    overlay.appendChild(leaf);

    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() * 800 - 400);
    const startY = -100;
    const endY = window.innerHeight + 200;
    const midX1 = startX + (Math.random() * 500 - 250);
    const midX2 = endX + (Math.random() * 500 - 250);
    const path = `M${startX},${startY} C${midX1},${window.innerHeight * 0.3} ${midX2},${window.innerHeight * 0.7} ${endX},${endY}`;

    const duration = 12 + Math.random() * 6;

    gsap.timeline()
      .to(leaf, {
        duration,
        motionPath: { path, autoRotate: false },
        rotation: `+=${Math.random() * 1440}`,
        ease: "sine.inOut"
      })
      .to(leaf, { opacity: 0, duration: 1.5 }, "-=1.2")
      .eventCallback("onComplete", () => leaf.remove());
  }
}

function createBirdsFlockEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const birdEmojis = ['🕊️', '🐦', '🦅'];

  for (let i = 0; i < 8; i++) {
    const bird = document.createElement('div');
    bird.innerHTML = birdEmojis[Math.floor(Math.random() * birdEmojis.length)];
    bird.style.position = 'absolute';
    bird.style.fontSize = `${Math.random() * 20 + 35}px`;
    bird.style.opacity = 0.9;
    overlay.appendChild(bird);

    const startX = -200;
    const startY = Math.random() * window.innerHeight * 0.6 + 50;
    const endX = window.innerWidth + 200;
    const endY = startY + (Math.random() * 200 - 100);
    const midX = window.innerWidth / 2 + (Math.random() * 300 - 150);
    const midY = Math.random() * window.innerHeight * 0.4;
    const path = `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;

    const duration = 8 + Math.random() * 4;

    gsap.timeline()
      .to(bird, {
        duration,
        motionPath: { path, autoRotate: true },
        ease: "power1.inOut",
        scale: 1,
        yoyo: true
      })
      .to(bird, { opacity: 0, duration: 1 }, "-=1")
      .eventCallback("onComplete", () => bird.remove());
  }
}

function createFloatingPetalsEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const petalEmojis = ['🌸', '🌺', '💮'];

  for (let i = 0; i < 25; i++) {
    const petal = document.createElement('div');
    petal.innerHTML = petalEmojis[Math.floor(Math.random() * petalEmojis.length)];
    petal.style.position = 'absolute';
    petal.style.fontSize = `${Math.random() * 10 + 20}px`;
    petal.style.opacity = 0.8;
    petal.style.pointerEvents = 'none';
    overlay.appendChild(petal);

    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() * 300 - 150);
    const startY = window.innerHeight + 100;
    const endY = -200;
    const mid1X = startX + (Math.random() * 200 - 100);
    const mid2X = endX + (Math.random() * 200 - 100);
    const path = `M${startX},${startY} C${mid1X},${window.innerHeight * 0.6} ${mid2X},${window.innerHeight * 0.3} ${endX},${endY}`;

    const duration = 10 + Math.random() * 5;

    gsap.timeline()
      .to(petal, {
        duration,
        motionPath: { path, autoRotate: false },
        rotation: `+=${Math.random() * 720 + 360}`,
        ease: "sine.inOut",
        scale: Math.random() * 0.5 + 1
      })
      .to(petal, { opacity: 0, duration: 1.5 }, "-=1")
      .eventCallback("onComplete", () => petal.remove());
  }
}

function createStarsShowerEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const starEmojis = ['⭐', '✨', '🌟'];

  for (let i = 0; i < 35; i++) {
    const star = document.createElement('div');
    star.innerHTML = starEmojis[Math.floor(Math.random() * starEmojis.length)];
    star.style.position = 'absolute';
    star.style.fontSize = `${Math.random() * 8 + 20}px`;
    star.style.opacity = 0.9;
    overlay.appendChild(star);

    const startX = Math.random() * window.innerWidth;
    const startY = -50;
    const endX = startX + (Math.random() * 800 - 400);
    const endY = window.innerHeight + 300;
    const duration = 1.8 + Math.random();

    gsap.timeline()
      .to(star, {
        duration,
        motionPath: { path: `M${startX},${startY} L${endX},${endY}` },
        ease: "power2.in",
        rotation: Math.random() * 360,
        opacity: 1
      })
      .to(star, { opacity: 0, duration: 0.4 }, "-=0.2")
      .eventCallback("onComplete", () => star.remove());
  }
}

function createHeartRainEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const heartEmojis = ['💚', '💖', '💕'];

  for (let i = 0; i < 25; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    heart.style.position = 'absolute';
    heart.style.fontSize = `${Math.random() * 15 + 25}px`;
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1001';
    heart.style.filter = 'drop-shadow(0 0 6px rgba(255,150,200,0.6))';
    overlay.appendChild(heart);

    const startX = Math.random() * window.innerWidth * 1.2 - window.innerWidth * 0.1;
    const endX = startX + (Math.random() * 200 - 100);
    const startY = -150;
    const endY = window.innerHeight + 200;
    const midX = startX + (Math.random() * 300 - 150);
    const midY = window.innerHeight / 2 + (Math.random() * 100 - 50);
    const path = `M${startX},${startY} Q${midX},${midY} ${endX},${endY}`;

    const duration = 8 + Math.random() * 5;

    gsap.timeline()
      .to(heart, {
        duration,
        motionPath: { path, autoRotate: false },
        ease: "sine.inOut"
      })
      // Gentle glowing pulse
      .to(heart, {
        duration: 1.4,
        scale: 1.15,
        ease: "sine.inOut",
        repeat: Math.floor(duration / 1.4),
        yoyo: true
      }, 0)
      // Slow rotation
      .to(heart, {
        duration,
        rotation: `+=${Math.random() * 360}`,
        ease: "none"
      }, 0)
      // Soft fade near end
      .to(heart, {
        duration: 2,
        opacity: 0,
        ease: "power2.out"
      }, duration - 2)
      .eventCallback("onComplete", () => heart.remove());
  }
}


function createButterflyDanceEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const butterflies = ['🦋'];

  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.innerHTML = butterflies[0];
    b.style.position = 'absolute';
    b.style.fontSize = `${Math.random() * 10 + 25}px`;
    b.style.pointerEvents = 'none';
    b.style.zIndex = '1001';
    overlay.appendChild(b);

    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 100;
    const endX = Math.random() * window.innerWidth;
    const endY = -150;
    const mid1X = (startX + endX) / 2 + (Math.random() * 400 - 200);
    const mid1Y = window.innerHeight / 2 + (Math.random() * 200 - 100);
    const path = `M${startX},${startY} Q${mid1X},${mid1Y} ${endX},${endY}`;

    const duration = 10 + Math.random() * 4;

    gsap.timeline()
      .to(b, {
        duration,
        motionPath: { path, autoRotate: true },
        ease: "power1.inOut"
      })
      // Wing flutter
      .to(b, {
        duration: 0.1,
        scaleX: 0.6,
        ease: "sine.inOut",
        repeat: duration * 10,
        yoyo: true
      }, 0)
      // Gentle breathing motion
      .to(b, {
        duration: 3,
        scale: 1.2,
        ease: "sine.inOut",
        repeat: Math.floor(duration / 3),
        yoyo: true
      }, 0)
      // Fade out at end
      .to(b, { opacity: 0, duration: 2 }, duration - 2)
      .eventCallback("onComplete", () => b.remove());
  }
}


function createSnowflakeEffect() {
  const overlay = document.getElementById('transitionOverlay');
  const snowEmojis = ['❄️', '❅', '🌨️'];

  for (let i = 0; i < 35; i++) {
    const flake = document.createElement('div');
    flake.innerHTML = snowEmojis[Math.floor(Math.random() * snowEmojis.length)];
    flake.style.position = 'absolute';
    flake.style.fontSize = `${Math.random() * 10 + 20}px`;
    flake.style.opacity = Math.random() * 0.5 + 0.5;
    flake.style.pointerEvents = 'none';
    flake.style.zIndex = '1001';
    overlay.appendChild(flake);

    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() * 200 - 100);
    const startY = -150;
    const endY = window.innerHeight + 200;
    const mid1X = startX + (Math.random() * 150 - 75);
    const mid2X = endX + (Math.random() * 150 - 75);
    const path = `M${startX},${startY} C${mid1X},${window.innerHeight * 0.3} ${mid2X},${window.innerHeight * 0.7} ${endX},${endY}`;

    const duration = 12 + Math.random() * 8;

    gsap.timeline()
      .to(flake, {
        duration,
        motionPath: { path, autoRotate: false },
        ease: "none"
      })
      // Gentle rotation and pulsing
      .to(flake, {
        duration,
        rotation: `+=${Math.random() * 720}`,
        ease: "none"
      }, 0)
      .to(flake, {
        duration: 3,
        scale: Math.random() * 0.5 + 1.1,
        ease: "sine.inOut",
        repeat: Math.floor(duration / 3),
        yoyo: true
      }, 0)
      // Fade out at end
      .to(flake, { opacity: 0, duration: 2 }, duration - 2)
      .eventCallback("onComplete", () => flake.remove());
  }
}


function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const progress = (currentSectionIndex / (sections.length - 1)) * 100;
  
  // Animate progress bar with GSAP
  gsap.to(progressFill, { width: `${progress}%`, duration: 0.8, ease: "power2.out" });
}

function showSection(sectionId) {
  const currentSection = document.querySelector('.screen.active');
  const newSection = document.getElementById(sectionId);
  
  if (!newSection) return;
  
  // Update section index for progress tracking
  currentSectionIndex = sections.indexOf(sectionId);
  updateProgress();
  
  // Assign unique animation to each section
  let animationEffect;
  switch(sectionId) {
    case 'journey':
      animationEffect = createBirdsFlockEffect;
      break;
    case 'first-moments':
      animationEffect = createFloatingPetalsEffect;
      break;
    case 'growing-together':
      animationEffect = createAutumnLeavesEffect;
      break;
    case 'what-i-love':
      animationEffect = createHeartRainEffect;
      break;
    case 'our-future':
      animationEffect = createStarsShowerEffect;
      break;
    case 'birthday-message':
      animationEffect = createButterflyDanceEffect;
      break;
    default:
      animationEffect = createSnowflakeEffect;
  }
  
  // Play the unique animation for this section
  animationEffect();
  
  // Use GSAP for smooth transitions
  if (currentSection) {
    gsap.to(currentSection, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        currentSection.classList.remove('active');
        currentSection.style.display = 'none';
        
        // Show new section
        newSection.style.display = 'block';
        gsap.fromTo(newSection, 
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.6, 
            ease: "power2.out",
            onComplete: () => newSection.classList.add('active')
          }
        );
      }
    });
  } else {
    // First transition (from welcome)
    newSection.style.display = 'block';
    gsap.fromTo(newSection, 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "power2.out",
        onComplete: () => newSection.classList.add('active')
      }
    );
  }
}

const btn = document.getElementById("enterBtn");
const input = document.getElementById("password");
const error = document.getElementById("error");

async function handlePasswordSubmission() {
  // Start audio on first interaction
  startAudioOnInteraction();
  
  const entered = input.value.trim();
  const hash = await hashMessage(entered);

  if (hash === PASSWORD_HASH) {
    // Hide welcome, show journey
    showSection('journey');
  } else {
    error.classList.remove("hidden");
    input.value = "";
    
    // Shake animation for error feedback
    gsap.to(input, { x: -10, duration: 0.1, yoyo: true, repeat: 5, ease: "power2.inOut" });
  }
}

// Button click event
btn.addEventListener("click", handlePasswordSubmission);

// Enter key support for password input
input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission
    handlePasswordSubmission();
  }
});

// Start audio on any input interaction
input.addEventListener("focus", startAudioOnInteraction);
input.addEventListener("input", startAudioOnInteraction);

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  updateProgress();
  initializeAudio();
  
  // Focus the password input for immediate typing
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      passwordInput.focus();
    }, 100);
  }
  
  // Handle window resize for canvas
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('animationCanvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
  
  // Start audio on ANY user interaction with the page
  const startAudioEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
  startAudioEvents.forEach(eventType => {
    document.addEventListener(eventType, startAudioOnInteraction, { once: true });
  });
});
