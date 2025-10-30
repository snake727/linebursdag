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
    toggleBtn.textContent = "🔊";
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

// ====== VIDEO ANIMATION SYSTEM ======
let videoOverlay = null;
let currentVideo = null;

// Map sections to their video files
const sectionVideos = {
  "journey": "./stars2.webm",
  "first-moments": "./leafblow.webm",
  "growing-together": "./leafblow.webm",
  "what-i-love": "./leafblow.webm",
  "our-future": "./stars2.webm",
  "birthday-message": null
};

function initVideoOverlay() {
  if (!videoOverlay) {
    videoOverlay = document.createElement('div');
    videoOverlay.id = 'videoOverlay';
    videoOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    document.body.appendChild(videoOverlay);
  }
  return videoOverlay;
}

function stopCurrentVideo(options = {}) {
  const { immediate = false } = options;
  if (currentVideo) {
    currentVideo.pause();
    // Release the decoder resources from the previous source
    currentVideo.removeAttribute("src");
    currentVideo.load();
    currentVideo.remove();
    currentVideo = null;
  }

  if (videoOverlay) {
    gsap.killTweensOf(videoOverlay);
    if (immediate) {
      videoOverlay.style.opacity = 0;
      videoOverlay.innerHTML = "";
    } else {
      gsap.to(videoOverlay, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          videoOverlay.innerHTML = "";
        }
      });
    }
  }
}

function playVideoForSection(sectionId) {
  // Stop any currently playing video
  stopCurrentVideo({ immediate: true });
  
  const videoPath = sectionVideos[sectionId];
  if (!videoPath) {
    console.log(`No video configured for section: ${sectionId}`);
    return;
  }
  
  console.log(`Starting video for section: ${sectionId}`);
  const overlay = initVideoOverlay();
  
  // Create video element that sits directly in the overlay
  const video = document.createElement('video');
  video.src = videoPath;
  video.preload = 'auto';
  video.loop = false; // Play once to give the feeling of a transition
  video.muted = true; // Ensure autoplay works everywhere
  video.autoplay = true;
  video.playsInline = true;
  video.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
  `;

  // Replace any existing overlay content with the new video
  overlay.innerHTML = '';
  overlay.appendChild(video);

  currentVideo = video;

  const fadeInVideo = () => {
    // Start fully transparent to avoid flashes when switching sections
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    });
  };

  // Fade-in once the browser has a frame ready to display
  video.addEventListener('loadeddata', fadeInVideo, { once: true });

  if (video.readyState >= video.HAVE_CURRENT_DATA) {
    fadeInVideo();
  }

  video.addEventListener('ended', () => {
    // Gently hide the overlay as soon as the clip finishes
    if (videoOverlay) {
      gsap.to(videoOverlay, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut"
      });
    }
  });

  video.addEventListener('error', (e) => {
    console.error('Failed to load section video:', e);
  });

  // Kick off playback and gracefully handle browsers that require gestures
  video.play().catch(() => {
    console.warn('Autoplay was blocked. The video will start after user interaction.');
  });
}

// ====== SECTION NAVIGATION ======
let currentSection = "welcome";
let isTransitioningSection = false;

function showSection(id) {
  const oldSection = document.getElementById(currentSection);
  const newSection = document.getElementById(id);

  if (!newSection || isTransitioningSection) return;
  
  isTransitioningSection = true;

  // Stop current video when changing sections
  stopCurrentVideo();

  // Fade out current section, then fade in new section
  if (oldSection && oldSection !== newSection) {
    gsap.set(oldSection, { opacity: 1 });
    
    gsap.to(oldSection, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        oldSection.classList.remove("active");
        gsap.set(oldSection, { display: "none" });
        
        // Fade in new section
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
            // Start video for the new section
            playVideoForSection(id);
          }
        });
      }
    });
  } else {
    // First section or same section - immediate switch
    gsap.set(newSection, { opacity: 1, display: "block" });
    newSection.classList.add("active");
    currentSection = id;
    updateProgress(id);
    isTransitioningSection = false;
    // Start video for the section
    playVideoForSection(id);
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

// ====== INITIALIZE ======
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing website...");
  
  // Initialize the welcome section with GSAP
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
