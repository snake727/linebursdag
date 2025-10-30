/* === SCRIPT.JS - Clean version without animations === */

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

// ====== SECTION NAVIGATION ======
let currentSection = "welcome";
let isTransitioningSection = false;

function showSection(id) {
  const oldSection = document.getElementById(currentSection);
  const newSection = document.getElementById(id);

  if (!newSection || isTransitioningSection) return;
  
  isTransitioningSection = true;

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
