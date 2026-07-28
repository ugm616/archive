const PASSWORD_HASH = "109e66a22099f51a651245912e8f72e924fd95728f4c40872788aa97787c582f";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function checkAuth() {
  if (sessionStorage.getItem("wiki_auth") === "true") {
    return true;
  }
  
  const form = document.getElementById("auth-form");
  if (!form) return false;
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const input = document.getElementById("password");
    const errorEl = document.getElementById("auth-error");
    const submitBtn = form.querySelector("button[type=submit]");
    
    if (!input.value) {
      if (errorEl) errorEl.textContent = "Please enter a password";
      return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Verifying...";
    
    try {
      const hash = await hashPassword(input.value);
      if (hash === PASSWORD_HASH) {
        sessionStorage.setItem("wiki_auth", "true");
        if (errorEl) errorEl.textContent = "";
        window.location.href = "wiki.html";
      } else {
        if (errorEl) errorEl.textContent = "Incorrect password";
        input.value = "";
        input.focus();
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (errorEl) errorEl.textContent = "Authentication failed";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Access Archive";
    }
  });
  
  return false;
}

function requireAuth() {
  if (sessionStorage.getItem("wiki_auth") !== "true") {
    window.location.href = "/archive/";
    return false;
  }
  return true;
}

function logout() {
  sessionStorage.removeItem("wiki_auth");
  window.location.href = "/archive/";
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/archive/" || window.location.pathname === "/archive") {
    await checkAuth();
  } else {
    requireAuth();
  }
});

if (typeof module !== "undefined") {
  module.exports = { checkAuth, requireAuth, logout, hashPassword };
}
