let searchIndex = null;
let articlesData = null;

async function loadSearchIndex() {
  if (searchIndex) return searchIndex;
  
  articlesData = await fetch("_data/articles.json").then(r => r.json());
  
  if (typeof lunr === "undefined") {
    console.warn("lunr.js not loaded, falling back to simple search");
    return null;
  }
  
  searchIndex = lunr(function () {
    this.ref("slug");
    this.field("title", { boost: 10 });
    this.field("description", { boost: 5 });
    this.field("tags", { boost: 3 });
    this.field("content");
    
    articlesData.forEach(doc => {
      this.add({
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        tags: doc.tags.join(" "),
        content: doc.searchContent || ""
      });
    });
  });
  
  return searchIndex;
}

async function fetchArticleContent(slug) {
  const article = articlesData.find(a => a.slug === slug);
  if (!article) return "";
  
  try {
    const response = await fetch(article.contentPath);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const contentEl = doc.querySelector(".article-content");
    return contentEl ? contentEl.textContent : "";
  } catch {
    return "";
  }
}

async function buildFullIndex() {
  await loadSearchIndex();
  
  for (const article of articlesData) {
    if (!article.searchContent) {
      article.searchContent = await fetchArticleContent(article.slug);
    }
  }
  
  searchIndex = lunr(function () {
    this.ref("slug");
    this.field("title", { boost: 10 });
    this.field("description", { boost: 5 });
    this.field("tags", { boost: 3 });
    this.field("content");
    
    articlesData.forEach(doc => {
      this.add({
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        tags: doc.tags.join(" "),
        content: doc.searchContent || ""
      });
    });
  });
}

function search(query) {
  if (!searchIndex || !query || query.trim().length < 2) {
    return articlesData || [];
  }
  
  const results = searchIndex.search(query.trim());
  return results.map(r => {
    const article = articlesData.find(a => a.slug === r.ref);
    return { ...article, score: r.score };
  });
}

function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

async function initSearch() {
  await buildFullIndex();
  
  const input = document.getElementById("search-input");
  const resultsContainer = document.getElementById("search-results");
  const countEl = document.getElementById("search-results-count");
  
  if (!input) return;
  
  input.addEventListener("input", debounce(async () => {
    const query = input.value.trim();
    const results = search(query);
    
    if (resultsContainer) {
      renderSearchResults(results, resultsContainer);
    }
    if (countEl) {
      countEl.textContent = query ? results.length + " results" : "";
    }
  }, 150));
}

function renderSearchResults(results, container) {
  container.innerHTML = "";
  
  if (results.length === 0) {
    container.innerHTML = '<p class="no-results">No articles found</p>';
    return;
  }
  
  const fragment = document.createDocumentFragment();
  results.forEach(article => {
    const el = document.createElement("a");
    el.href = article.contentPath;
    el.className = "search-result-item";
    el.innerHTML = `
      <h4>${escapeHtml(article.title)}</h4>
      <p>${escapeHtml(article.description)}</p>
      <div class="search-result-tags">
        ${article.tags.map(t => '<span class="tag">' + escapeHtml(t) + '</span>').join("")}
      </div>
    `;
    fragment.appendChild(el);
  });
  container.appendChild(fragment);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", initSearch);

if (typeof module !== "undefined") {
  module.exports = { loadSearchIndex, search, buildFullIndex };
}
