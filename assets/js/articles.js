let currentArticles = [];

async function loadArticles() {
  try {
    const response = await fetch("_data/articles.json");
    if (!response.ok) throw new Error("Failed to load articles");
    currentArticles = await response.json();
    return currentArticles;
  } catch (error) {
    console.error("Error loading articles:", error);
    return [];
  }
}

function getAllTags() {
  const tags = new Set();
  currentArticles.forEach(article => {
    article.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags).sort();
}

function renderTagNavigation(activeTag = "all") {
  const tagContainer = document.getElementById("tag-list");
  if (!tagContainer) return;
  
  const tags = getAllTags();
  tagContainer.innerHTML = "";
  
  const allBtn = createTagButton("all", "All", activeTag === "all");
  tagContainer.appendChild(allBtn);
  
  tags.forEach(tag => {
    const btn = createTagButton(tag, tag, activeTag === tag);
    tagContainer.appendChild(btn);
  });
}

function createTagButton(tag, label, isActive) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tag" + (isActive ? " active" : "");
  btn.dataset.tag = tag;
  btn.textContent = label;
  btn.addEventListener("click", () => {
    document.querySelectorAll("#tag-list .tag").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (typeof filterByTag === "function") {
      filterByTag(tag);
    } else {
      const url = new URL(window.location);
      if (tag === "all") url.searchParams.delete("tag");
      else url.searchParams.set("tag", tag);
      window.history.pushState({}, "", url);
      applyFilters();
    }
  });
  return btn;
}

function renderArticlesGrid(articles = currentArticles) {
  const grid = document.getElementById("articles-grid");
  const noResults = document.getElementById("no-results");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  if (articles.length === 0) {
    if (noResults) noResults.hidden = false;
    return;
  }
  
  if (noResults) noResults.hidden = true;
  
  const fragment = document.createDocumentFragment();
  
  articles.forEach(article => {
    const card = createArticleCard(article);
    fragment.appendChild(card);
  });
  
  grid.appendChild(fragment);
}

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";
  card.setAttribute("role", "listitem");
  
  const aspectClass = article.aspectRatio ? "aspect-" + article.aspectRatio : "";
  
  card.innerHTML = `
    <a href="${article.contentPath}" class="article-card-link">
      <div class="article-card-image ${aspectClass}">
        <img src="${article.image}" alt="" loading="lazy">
      </div>
      <div class="article-card-content">
        <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
        <p class="article-card-excerpt">${escapeHtml(article.description)}</p>
        <div class="article-card-tags">
          ${article.tags.map(tag => '<span class="tag">' + escapeHtml(tag) + '</span>').join("")}
        </div>
      </div>
    </a>
  `;
  
  return card;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function applyFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get("tag") || "all";
  const query = document.getElementById("search-input")?.value?.toLowerCase() || "";
  
  const filtered = currentArticles.filter(article => {
    const matchesTag = tag === "all" || article.tags.includes(tag);
    const matchesQuery = !query || article.title.toLowerCase().includes(query)
      || article.description.toLowerCase().includes(query)
      || article.tags.some(t => t.toLowerCase().includes(query));
    return matchesTag && matchesQuery;
  });
  
  renderTagNavigation(tag);
  renderArticlesGrid(filtered);
  
  const countEl = document.getElementById("search-results-count");
  if (countEl) {
    countEl.textContent = query || tag !== "all" ? filtered.length + " articles" : "";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadArticles();
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get("tag") || "all";
  renderTagNavigation(tag);
  applyFilters();
  
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(applyFilters, 150));
  }
});

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

if (typeof module !== "undefined") {
  module.exports = { loadArticles, renderArticlesGrid, renderTagNavigation, applyFilters };
}
