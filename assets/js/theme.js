const THEME_KEY = "wiki-theme";

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY);
}

function getPreferredTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  
  const logoLight = document.getElementById("site-logo") || document.getElementById("auth-logo");
  if (logoLight) {
    logoLight.src = theme === "dark" 
      ? "assets/images/logos/logo-dark.svg"
      : "assets/images/logos/logo-light.svg";
  }
  
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
}

function initTheme() {
  const theme = getPreferredTheme();
  applyTheme(theme);
  
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", toggleTheme);
  }
  
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
}

document.addEventListener("DOMContentLoaded", initTheme);

if (typeof module !== "undefined") {
  module.exports = { initTheme, applyTheme, toggleTheme, getPreferredTheme };
}
