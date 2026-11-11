/* ===================================================================
   APPLE EDITORIAL BLOG ENGINE
   Manages:
   - Dynamic Post Listing & Search Filtering
   - Single Article Reading View
   - Admin Article Composer (Write, Edit, Publish)
   - Real-time Comments Integration
   =================================================================== */

class BlogEngine {
  constructor() {
    this.posts = [];
    this.activeCategory = "All";
    this.searchQuery = "";
    this.currentPost = null;

    this.init();
  }

  async init() {
    this.attachGlobalListeners();

    // Check URL parameters for single post
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get("post");

    if (postSlug) {
      await this.loadSingleArticle(postSlug);
    } else {
      await this.loadArticlesList();
    }

    // Listen for Auth changes to toggle Admin features
    if (window.firebaseService) {
      window.firebaseService.onAuthStateChanged(user => {
        this.renderAdminControls(user);
      });
    }
  }

  attachGlobalListeners() {
    // Popstate for back/forward navigation
    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(window.location.search);
      const postSlug = params.get("post");
      if (postSlug) {
        this.loadSingleArticle(postSlug, false);
      } else {
        this.loadArticlesList(false);
      }
    });
  }

  /* ===================================================================
     ARTICLES LIST VIEW
     =================================================================== */
  async loadArticlesList(pushState = true) {
    if (pushState && window.location.search) {
      window.history.pushState({}, "", "blog.html");
    }

    const container = document.getElementById("blog-app-container");
    if (!container) return;

    container.innerHTML = `
      <section class="blog-hero">
        <div class="container">
          <div class="section-tag">EDITORIAL &amp; PERSPECTIVES</div>
          <h1 class="blog-hero-title">Architectural Notes &amp; Insights</h1>
          <p class="blog-hero-subtitle">
            Essays on enterprise distributed systems, production AI/ML architectures, and technical leadership by Nikhil Mothkuri.
          </p>

          <!-- Category and Search Controls Bar -->
          <div class="blog-controls-bar">
            <div class="blog-category-pills" id="blog-category-pills">
              <button class="blog-category-pill ${this.activeCategory === 'All' ? 'active' : ''}" data-cat="All">All</button>
              <button class="blog-category-pill ${this.activeCategory === 'Architecture' ? 'active' : ''}" data-cat="Architecture">Architecture</button>
              <button class="blog-category-pill ${this.activeCategory === 'AI & ML' ? 'active' : ''}" data-cat="AI & ML">AI &amp; ML</button>
              <button class="blog-category-pill ${this.activeCategory === 'Leadership' ? 'active' : ''}" data-cat="Leadership">Leadership</button>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="blog-search-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="blog-search-input" class="blog-search-input" placeholder="Search essays..." value="${this.escapeHtml(this.searchQuery)}">
              </div>

              <!-- Admin New Post Button (Dynamically shown) -->
              <div id="blog-admin-actions"></div>
            </div>
          </div>
        </div>
      </section>

      <main class="container">
        <div class="articles-grid" id="articles-grid">
          <div style="text-align: center; grid-column: 1/-1; padding: 60px 0; color: var(--text-muted);">
            Loading articles...
          </div>
        </div>
      </main>
    `;

    // Fetch posts from CMS service
    if (window.cmsService) {
      this.posts = await window.cmsService.getPosts();
    }

    this.renderArticlesGrid();
    this.attachListControls();

    const currentUser = window.firebaseService ? window.firebaseService.getCurrentUser() : null;
    this.renderAdminControls(currentUser);
  }

  renderArticlesGrid() {
    const grid = document.getElementById("articles-grid");
    if (!grid) return;

    let filtered = this.posts;

    // Filter by Category
    if (this.activeCategory !== "All") {
      filtered = filtered.filter(p => p.category === this.activeCategory);
    }

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div style="text-align: center; grid-column: 1/-1; padding: 60px 0; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 12px;">🔍</div>
          <h3 style="color: var(--text-bright); margin-bottom: 6px;">No articles found</h3>
          <p style="font-size: 0.94rem;">Try adjusting your search terms or category filter.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(post => {
      const dateFormatted = new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

      return `
        <article class="article-card" data-slug="${post.slug || post.id}">
          <div>
            <div class="article-card-header">
              <span class="article-category-badge">${this.escapeHtml(post.category || 'Architecture')}</span>
              <span class="article-read-time">${this.escapeHtml(post.readTime || '5 min read')}</span>
            </div>
            <h2 class="article-card-title">${this.escapeHtml(post.title)}</h2>
            <p class="article-card-excerpt">${this.escapeHtml(post.excerpt)}</p>
          </div>

          <div class="article-card-footer">
            <div class="article-author-mini">
              <img src="${post.authorAvatar || 'assets/avatar.jpg'}" alt="${this.escapeHtml(post.authorName || 'Nikhil Mothkuri')}">
              <span>${this.escapeHtml(post.authorName || 'Nikhil Mothkuri')}</span>
            </div>
            <time datetime="${post.createdAt}">${dateFormatted}</time>
          </div>
        </article>
      `;
    }).join("");

    // Attach click listener to cards
    grid.querySelectorAll(".article-card").forEach(card => {
      card.addEventListener("click", () => {
        const slug = card.getAttribute("data-slug");
        this.loadSingleArticle(slug);
      });
    });
  }

  attachListControls() {
    // Category pills
    const pillContainer = document.getElementById("blog-category-pills");
    if (pillContainer) {
      pillContainer.querySelectorAll(".blog-category-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          pillContainer.querySelectorAll(".blog-category-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          this.activeCategory = pill.getAttribute("data-cat");
          this.renderArticlesGrid();
        });
      });
    }

    // Search input
    const searchInput = document.getElementById("blog-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderArticlesGrid();
      });
    }
  }

  /* ===================================================================
     SINGLE ARTICLE VIEW
     =================================================================== */
  async loadSingleArticle(slugOrId, pushState = true) {
    if (pushState) {
      window.history.pushState({}, "", `blog.html?post=${encodeURIComponent(slugOrId)}`);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const container = document.getElementById("blog-app-container");
    if (!container) return;

    container.innerHTML = `
      <div class="single-article-view">
        <div style="text-align: center; padding: 100px 0; color: var(--text-muted);">
          Loading article...
        </div>
      </div>
    `;

    let post = null;
    if (window.cmsService) {
      post = await window.cmsService.getPost(slugOrId);
    }

    if (!post) {
      container.innerHTML = `
        <div class="single-article-view" style="text-align: center; padding: 100px 0;">
          <h2 style="font-size: 2rem; margin-bottom: 12px; color: var(--text-bright);">Article Not Found</h2>
          <p style="color: var(--text-secondary); margin-bottom: 24px;">The article you are looking for does not exist or may have been unlisted.</p>
          <button class="btn btn-primary" id="article-error-back-btn">Return to Articles</button>
        </div>
      `;
      const backBtn = document.getElementById("article-error-back-btn");
      if (backBtn) backBtn.addEventListener("click", () => this.loadArticlesList());
      return;
    }

    this.currentPost = post;

    const dateFormatted = new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    const isCurrentAdmin = window.firebaseService ? window.firebaseService.isAdmin(window.firebaseService.getCurrentUser()) : false;

    container.innerHTML = `
      <article class="single-article-view">
        <nav class="article-back-nav" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="article-back-btn" id="article-back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>All Articles</span>
          </button>

          ${isCurrentAdmin ? `
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" id="admin-edit-post-btn">Edit Article</button>
              <button class="btn btn-secondary btn-sm" id="admin-delete-post-btn" style="color: var(--apple-red);">Delete</button>
            </div>
          ` : ''}
        </nav>

        <header class="article-full-header">
          <span class="article-full-category">${this.escapeHtml(post.category || 'Architecture')}</span>
          <h1 class="article-full-title">${this.escapeHtml(post.title)}</h1>

          <div class="article-full-meta">
            <div class="article-author-avatar-wrap">
              <img src="${post.authorAvatar || 'assets/avatar.jpg'}" alt="${this.escapeHtml(post.authorName || 'Nikhil Mothkuri')}">
            </div>
            <div>
              <div style="font-weight: 600; color: var(--text-bright);">${this.escapeHtml(post.authorName || 'Nikhil Mothkuri')}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${this.escapeHtml(post.authorRole || 'Lead Software Architect')}</div>
            </div>
            <span style="color: var(--border-medium);">•</span>
            <time datetime="${post.createdAt}">${dateFormatted}</time>
            <span style="color: var(--border-medium);">•</span>
            <span>${this.escapeHtml(post.readTime || '5 min read')}</span>
          </div>
        </header>

        <div class="article-full-content" id="article-full-content">
          ${this.renderMarkdown(post.content)}
        </div>

        <!-- Author Card -->
        <div class="article-author-card">
          <div class="article-author-card-avatar">
            <img src="${post.authorAvatar || 'assets/avatar.jpg'}" alt="Nikhil Mothkuri">
          </div>
          <div>
            <h4 style="font-size: 1.15rem; color: var(--text-bright); margin-bottom: 4px;">Written by Nikhil Mothkuri</h4>
            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55;">
              Lead Software Architect at JPMorgan Chase &amp; Co. with international tenure across Dell Technologies Ireland, Oracle, and Infosys. Specialized in distributed systems and enterprise AI.
            </p>
          </div>
        </div>

        <!-- Interactive Discussion & Reader Comments -->
        <div id="post-comments-container"></div>
      </article>
    `;

    // Attach back listener
    const backBtn = document.getElementById("article-back-btn");
    if (backBtn) backBtn.addEventListener("click", () => this.loadArticlesList());

    // Admin edit/delete listeners
    if (isCurrentAdmin) {
      const editBtn = document.getElementById("admin-edit-post-btn");
      if (editBtn) editBtn.addEventListener("click", () => this.openPostComposer(post));

      const delBtn = document.getElementById("admin-delete-post-btn");
      if (delBtn) delBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to permanently delete this article?")) {
          await window.cmsService.deletePost(post.id);
          this.loadArticlesList();
        }
      });
    }

    // Initialize Comments Manager for this post
    if (window.commentsManager) {
      window.commentsManager.init(post.id, "post-comments-container");
    }
  }

  /* ===================================================================
     ADMIN ARTICLE COMPOSER
     =================================================================== */
  renderAdminControls(user) {
    const isOwner = window.firebaseService ? window.firebaseService.isAdmin(user) : false;
    const adminActions = document.getElementById("blog-admin-actions");
    if (!adminActions) return;

    if (isOwner) {
      adminActions.innerHTML = `
        <button class="btn btn-primary btn-sm" id="blog-new-post-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Write Article
        </button>
      `;

      const newPostBtn = document.getElementById("blog-new-post-btn");
      if (newPostBtn) newPostBtn.addEventListener("click", () => this.openPostComposer());
    } else {
      adminActions.innerHTML = ``;
    }
  }

  openPostComposer(post = null) {
    let modal = document.getElementById("post-composer-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "post-composer-modal";
      modal.className = "modal-overlay";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="modal-box composer-modal-box">
          <button class="modal-close" id="composer-modal-close" aria-label="Close modal">✕</button>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="font-size: 1.35rem; color: var(--text-bright);" id="composer-modal-title">Write New Essay</h3>
            <span style="font-size: 0.76rem; padding: 3px 8px; border-radius: var(--radius-full); background: var(--apple-blue-subtle); color: var(--apple-blue); font-weight: 500;">Markdown Enabled</span>
          </div>

          <form id="post-composer-form" class="composer-form">
            <input type="hidden" id="composer-post-id">

            <div class="form-group">
              <label class="form-label" for="composer-title">Article Title</label>
              <input type="text" id="composer-title" class="form-control" placeholder="e.g. Architecting Distributed Saga Workflows" required>
            </div>

            <div class="composer-row-2">
              <div class="form-group">
                <label class="form-label" for="composer-category">Category</label>
                <select id="composer-category" class="form-control">
                  <option value="Architecture">Architecture</option>
                  <option value="AI & ML">AI &amp; ML</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Cloud">Cloud &amp; Distributed Systems</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="composer-tags">Tags (comma-separated)</label>
                <input type="text" id="composer-tags" class="form-control" placeholder="Kafka, Java, MLOps, RFCs">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="composer-excerpt">Brief Excerpt</label>
              <textarea id="composer-excerpt" class="form-control" rows="2" placeholder="One or two sentences summarizing the key takeaway..." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="composer-content">Content (Markdown Supported)</label>
              <textarea id="composer-content" class="form-control composer-textarea" placeholder="## Section Title&#10;&#10;Write your essay using Markdown syntax. Code blocks and lists are automatically formatted." required></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
              <button type="button" class="btn btn-secondary" id="composer-cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="composer-save-btn">Publish to Blog</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      const closeBtn = document.getElementById("composer-modal-close");
      const cancelBtn = document.getElementById("composer-cancel-btn");
      if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));
      if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

      const form = document.getElementById("post-composer-form");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const saveBtn = document.getElementById("composer-save-btn");
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerText = "Publishing...";
          }

          try {
            const id = document.getElementById("composer-post-id").value;
            const title = document.getElementById("composer-title").value.trim();
            const category = document.getElementById("composer-category").value;
            const tags = document.getElementById("composer-tags").value.split(",").map(t => t.trim()).filter(Boolean);
            const excerpt = document.getElementById("composer-excerpt").value.trim();
            const content = document.getElementById("composer-content").value;

            const postPayload = {
              title,
              category,
              tags,
              excerpt,
              content,
              authorName: "Nikhil Mothkuri",
              authorRole: "Lead Software Architect",
              authorAvatar: "assets/avatar.jpg",
              status: "published"
            };
            if (id) postPayload.id = id;

            const saved = await window.cmsService.savePost(postPayload);
            modal.classList.remove("active");

            if (window.app && typeof window.app.showToast === "function") {
              window.app.showToast("Article published live!", "emerald");
            }

            // Reload article or list
            await this.loadSingleArticle(saved.slug || saved.id);
          } catch (err) {
            alert(`Could not publish post: ${err.message}`);
          } finally {
            if (saveBtn) {
              saveBtn.disabled = false;
              saveBtn.innerText = "Publish to Blog";
            }
          }
        });
      }
    }

    // Populate data if editing
    const titleHeader = document.getElementById("composer-modal-title");
    const saveBtn = document.getElementById("composer-save-btn");
    const idField = document.getElementById("composer-post-id");
    const titleField = document.getElementById("composer-title");
    const catField = document.getElementById("composer-category");
    const tagsField = document.getElementById("composer-tags");
    const excerptField = document.getElementById("composer-excerpt");
    const contentField = document.getElementById("composer-content");

    if (post) {
      if (titleHeader) titleHeader.textContent = "Edit Article";
      if (saveBtn) saveBtn.textContent = "Update Article";
      if (idField) idField.value = post.id || "";
      if (titleField) titleField.value = post.title || "";
      if (catField) catField.value = post.category || "Architecture";
      if (tagsField) tagsField.value = (post.tags || []).join(", ");
      if (excerptField) excerptField.value = post.excerpt || "";
      if (contentField) contentField.value = post.content || "";
    } else {
      if (titleHeader) titleHeader.textContent = "Write New Essay";
      if (saveBtn) saveBtn.textContent = "Publish to Blog";
      if (idField) idField.value = "";
      if (titleField) titleField.value = "";
      if (catField) catField.value = "Architecture";
      if (tagsField) tagsField.value = "";
      if (excerptField) excerptField.value = "";
      if (contentField) contentField.value = "";
    }

    modal.classList.add("active");
  }

  /* Utility Markdown Parser */
  renderMarkdown(text) {
    if (!text) return "";
    let html = this.escapeHtml(text);

    // Code blocks
    html = html.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    // Bold & Italic
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Lists
    html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
    html = html.replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>");

    // Paragraphs
    const paragraphs = html.split(/\n\s*\n/);
    return paragraphs.map(p => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith("<h") || p.startsWith("<pre") || p.startsWith("<ul") || p.startsWith("<block")) {
        return p;
      }
      return `<p>${p.replace(/\n/g, "<br>")}</p>`;
    }).join("");
  }

  escapeHtml(str) {
    if (typeof str !== "string") return str;
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Global instantiation
window.addEventListener("DOMContentLoaded", () => {
  window.blogEngine = new BlogEngine();
});
