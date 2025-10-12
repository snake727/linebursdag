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

function updateProgress() {
  const progressFill = document.getElementById('progress-fill');
  const progress = (currentSectionIndex / (sections.length - 1)) * 100;
  progressFill.style.width = `${progress}%`;
}

function showSection(sectionId) {
  const currentSection = document.querySelector('.screen.active');
  const newSection = document.getElementById(sectionId);
  
  if (!newSection) return;
  
  // Update section index for progress tracking
  currentSectionIndex = sections.indexOf(sectionId);
  updateProgress();
  
  // Hide current section
  if (currentSection) {
    currentSection.classList.remove('active');
  }
  
  setTimeout(() => {
    if (currentSection) {
      currentSection.style.display = 'none';
    }
    
    // Show new section with timing
    newSection.style.display = 'block';
    setTimeout(() => newSection.classList.add('active'), 100);
  }, 800);
}

const btn = document.getElementById("enterBtn");
const input = document.getElementById("password");
const error = document.getElementById("error");

btn.addEventListener("click", async () => {
  const entered = input.value.trim();
  const hash = await hashMessage(entered);

  if (hash === PASSWORD_HASH) {
    // Hide welcome, show journey
    showSection('journey');
  } else {
    error.classList.remove("hidden");
    input.value = "";
  }
});

// Initialize progress bar
document.addEventListener('DOMContentLoaded', () => {
  updateProgress();
});
