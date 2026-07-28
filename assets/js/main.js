function initMain() {
  console.log("Archive initialized");
  
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty("--transition-fast", "0.01ms");
    document.documentElement.style.setProperty("--transition-base", "0.01ms");
    document.documentElement.style.setProperty("--transition-slow", "0.01ms");
  }
  
  prefersReducedMotion.addEventListener("change", (e) => {
    if (e.matches) {
      document.documentElement.style.setProperty("--transition-fast", "0.01ms");
      document.documentElement.style.setProperty("--transition-base", "0.01ms");
      document.documentElement.style.setProperty("--transition-slow", "0.01ms");
    } else {
      document.documentElement.style.removeProperty("--transition-fast");
      document.documentElement.style.removeProperty("--transition-base");
      document.documentElement.style.removeProperty("--transition-slow");
    }
  });
}

document.addEventListener("DOMContentLoaded", initMain);

if (typeof module !== "undefined") {
  module.exports = { initMain };
}
