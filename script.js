// SHA-256 hashing helper
async function hashMessage(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Set this to the SHA-256 hash of your real password.
// You can generate it later by calling hashMessage("yourpassword") in console.
const PASSWORD_HASH = "38c69d88e8c0798840b4c4e3a69bec0e03b37329c97fdb9cf190bcffed22d4bf";

const btn = document.getElementById("enterBtn");
const input = document.getElementById("password");
const error = document.getElementById("error");

btn.addEventListener("click", async () => {
  const entered = input.value.trim();
  const hash = await hashMessage(entered);

  if (hash === PASSWORD_HASH) {
    // Hide welcome, show journey
    document.getElementById("welcome").classList.remove("active");
    setTimeout(() => {
      document.getElementById("welcome").style.display = "none";
      const journey = document.getElementById("journey");
      journey.style.display = "block";
      setTimeout(() => journey.classList.add("active"), 100);
    }, 800);
  } else {
    error.classList.remove("hidden");
    input.value = "";
  }
});
