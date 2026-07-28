function generateTOC() {
  const content = document.querySelector(".article-content");
  const tocList = document.getElementById("toc-list");
  const tocContainer = document.getElementById("toc");
  
  if (!content || !tocList) return;
  
  const headings = content.querySelectorAll("h2, h3");
  if (headings.length === 0) {
    if (tocContainer) tocContainer.style.display = "none";
    return;
  }
  
  tocList.innerHTML = "";
  
  let currentH2 = null;
  let currentH2Li = null;
  let currentH3Ol = null;
  
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + heading.id;
    a.textContent = heading.textContent;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(heading.id).scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", "#" + heading.id);
    });
    li.appendChild(a);
    
    if (heading.tagName === "H2") {
      currentH2 = li;
      currentH2Li = li;
      currentH3Ol = null;
      tocList.appendChild(li);
    } else if (heading.tagName === "H3" && currentH2Li) {
      if (!currentH3Ol) {
        currentH3Ol = document.createElement("ol");
        currentH3Ol.className = "toc-child";
        currentH2Li.appendChild(currentH3Ol);
      }
      currentH3Ol.appendChild(li);
    }
  });
}

function initScrollSpy() {
  const headings = document.querySelectorAll(".article-content h2[id], .article-content h3[id]");
  const tocLinks = document.querySelectorAll("#toc-list a");
  
  if (headings.length === 0 || tocLinks.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        tocLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { rootMargin: "-20% 0px -60% 0px", threshold: 0 });
  
  headings.forEach(h => observer.observe(h));
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".wiki-article")) {
    generateTOC();
    initScrollSpy();
  }
});

if (typeof module !== "undefined") {
  module.exports = { generateTOC, initScrollSpy };
}
