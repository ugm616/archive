function initExternalLinks() {
  document.querySelectorAll("a[href^=http]").forEach(link => {
    if (!link.href.startsWith(window.location.origin)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

document.addEventListener("DOMContentLoaded", initExternalLinks);

if (typeof module !== "undefined") {
  module.exports = { initExternalLinks };
}
