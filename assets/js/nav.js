let articlesData = null;

async function loadArticlesForNav() {
  if (articlesData) return articlesData;
  try {
    const response = await fetch("_data/articles.json");
    if (!response.ok) throw new Error("Failed to load articles");
    articlesData = await response.json();
    return articlesData;
  } catch (error) {
    console.error("Error loading articles:", error);
    return [];
  }
}

function getUniqueTags(articles) {
  const tags = new Set();
  articles.forEach(a => a.tags.forEach(t => tags.add(t)));
  return Array.from(tags).sort();
}

function renderTagNavigation(articles, activeTag = null) {
  const container = document.getElementById("tag-list");
  if (!container) return;
  
  const tags = getUniqueTags(articles);
  
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "tag" + (activeTag === null || activeTag === "all" ? " active" : "");
  allBtn.textContent = "All";
  allBtn.dataset.tag = "all";
  allBtn.addEventListener("click", () => filterByTag("all"));
  container.appendChild(allBtn);
  
  tags.forEach(tag => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag" + (activeTag === tag ? " active" : "");
    btn.textContent = tag;
    btn.dataset.tag = tag;
    btn.addEventListener("click", () => filterByTag(tag));
    container.appendChild(btn);
  });
}

function filterByTag(tag) {
  const url = new URL(window.location);
  if (tag === "all") {
    url.searchParams.delete("tag");
  } else {
    url.searchParams.set("tag", tag);
  }
  window.history.pushState({}, "", url);
  applyFilters();
}

function applyFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const activeTag = urlParams.get("tag");
  
  document.querySelectorAll("#tag-list .tag").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tag === (activeTag || "all"));
  });
  
  if (typeof renderArticlesGrid === "function") {
    const filtered = activeTag ? articlesData.filter(a => a.tags.includes(activeTag)) : articlesData;
    renderArticlesGrid(filtered);
  }
}

async function initNav() {
  const urlParams = new URLSearchParams(window.location.search);
  const activeTag = urlParams.get("tag");
  
  articlesData = await loadArticlesForNav();
  renderTagNavigation(articlesData, activeTag);
  
  if (typeof initArticles === "function") {
    await initArticles();
  }
}

document.addEventListener("DOMContentLoaded", initNav);

if (typeof module !== "undefined") {
  module.exports = { loadArticlesForNav, getUniqueTags, renderTagNavigation, filterByTag, applyFilters };
}
