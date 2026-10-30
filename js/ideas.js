/* ===================================================================
   INSIGHTS & PERSPECTIVES ENGINE
   Interactive Articles, Live Polls, Reactions & LocalStorage Comments
   =================================================================== */

class IdeasEngine {
  constructor(containerId, initialIdeas) {
    this.container = document.getElementById(containerId);
    this.storageKey = "nikhil_portfolio_ideas_state_v1";
    this.ideas = this.loadState(initialIdeas);
    this.activeCategory = "all";

    this.init();
  }

  loadState(initialIdeas) {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved comments & votes with initial data
        return initialIdeas.map(idea => {
          const found = parsed.find(p => p.id === idea.id);
          if (found) {
            return {
              ...idea,
              poll: found.poll || idea.poll,
              userVote: found.userVote || null,
              reactions: found.reactions || idea.reactions,
              userReactions: found.userReactions || {},
              comments: found.comments || idea.comments
            };
          }
          return { ...idea, userVote: null, userReactions: {} };
        });
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
    return initialIdeas.map(i => ({ ...i, userVote: null, userReactions: {} }));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.ideas));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  init() {
    if (!this.container) return;
    this.renderCategoryFilters();
    this.renderIdeas();
  }

  renderCategoryFilters() {
    const filterContainer = document.getElementById("ideas-filter-container");
    if (!filterContainer) return;

    const categories = [
      { id: "all", label: "All Insights" },
      { id: "ai", label: "AI & Agents" },
      { id: "systems", label: "Distributed Systems" },
      { id: "leadership", label: "Engineering Culture" },
      { id: "hottake", label: "Perspectives" }
    ];

    filterContainer.innerHTML = categories.map(cat => `
      <button class="idea-filter-btn ${cat.id === this.activeCategory ? 'active' : ''}" 
              data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join("");

    filterContainer.querySelectorAll(".idea-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filterContainer.querySelectorAll(".idea-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeCategory = btn.getAttribute("data-cat");
        this.renderIdeas();
      });
    });
  }

  renderIdeas() {
    const filtered = this.activeCategory === "all"
      ? this.ideas
      : this.ideas.filter(i => i.category === this.activeCategory);

    if (filtered.length === 0) {
      this.container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No insights in this category yet.</p>`;
      return;
    }

    this.container.innerHTML = filtered.map(idea => {
      const totalVotes = idea.poll.agree + idea.poll.disagree;
      const agreePct = totalVotes > 0 ? Math.round((idea.poll.agree / totalVotes) * 100) : 50;
      const disagreePct = 100 - agreePct;

      return `
        <article class="idea-card" id="idea-card-${idea.id}" data-id="${idea.id}">
          <div class="idea-card-header">
            <div class="idea-badges">
              <span class="category-tag ${idea.category}">${idea.categoryLabel}</span>
              <span class="prediction-horizon">${idea.horizon}</span>
            </div>
            <span style="font-size: 0.76rem; color: var(--text-muted);">
              ${idea.comments.length} comments
            </span>
          </div>

          <div class="conviction-box">
            <div class="conviction-header">
              <span class="conviction-label">Thesis Conviction</span>
              <span class="conviction-value">${idea.convictionLabel}</span>
            </div>
            <div class="conviction-bar">
              <div class="conviction-fill" style="width: ${idea.conviction}%"></div>
            </div>
          </div>

          <h3 class="idea-title">${idea.title}</h3>
          <p class="idea-content">${idea.summary}</p>

          <ul class="idea-bullet-points">
            ${idea.bullets.map(b => `<li>${b}</li>`).join("")}
          </ul>

          <!-- Live Voting Poll -->
          <div class="poll-section">
            <div class="poll-actions">
              <button class="poll-btn agree ${idea.userVote === 'agree' ? 'voted' : ''}" 
                      onclick="window.ideasEngine.vote('${idea.id}', 'agree')">
                Agree (${agreePct}%)
              </button>
              <button class="poll-btn disagree ${idea.userVote === 'disagree' ? 'voted' : ''}" 
                      onclick="window.ideasEngine.vote('${idea.id}', 'disagree')">
                Disagree (${disagreePct}%)
              </button>
            </div>
            <div class="poll-bar-track">
              <div class="poll-bar-agree-fill" style="width: ${agreePct}%"></div>
            </div>
            <div class="poll-stats-text">
              <span>${idea.poll.agree} agree</span>
              <span>${totalVotes} total responses</span>
              <span>${idea.poll.disagree} disagree</span>
            </div>
          </div>

          <!-- Reactions & Comment Opener -->
          <div class="idea-engagement-row">
            <div class="reaction-group">
              <button class="reaction-btn ${idea.userReactions && idea.userReactions.fire ? 'reacted' : ''}" 
                      onclick="window.ideasEngine.react('${idea.id}', 'fire')">
                Impact <span>${idea.reactions.fire}</span>
              </button>
              <button class="reaction-btn ${idea.userReactions && idea.userReactions.mindblown ? 'reacted' : ''}" 
                      onclick="window.ideasEngine.react('${idea.id}', 'mindblown')">
                Insight <span>${idea.reactions.mindblown}</span>
              </button>
              <button class="reaction-btn ${idea.userReactions && idea.userReactions.insight ? 'reacted' : ''}" 
                      onclick="window.ideasEngine.react('${idea.id}', 'insight')">
                Depth <span>${idea.reactions.insight}</span>
              </button>
              <button class="reaction-btn ${idea.userReactions && idea.userReactions.bullish ? 'reacted' : ''}" 
                      onclick="window.ideasEngine.react('${idea.id}', 'bullish')">
                Bullish <span>${idea.reactions.bullish}</span>
              </button>
            </div>

            <button class="comments-toggle-btn" onclick="window.ideasEngine.toggleComments('${idea.id}')">
              Discussion (${idea.comments.length})
            </button>
          </div>

          <!-- Comments Drawer -->
          <div class="idea-comments-drawer" id="comments-drawer-${idea.id}">
            <div class="comments-list" id="comments-list-${idea.id}">
              ${this.renderCommentsList(idea.comments)}
            </div>

            <!-- New Comment Form -->
            <form class="comment-form" onsubmit="window.ideasEngine.submitComment(event, '${idea.id}')">
              <div class="comment-form-inputs">
                <input type="text" class="comment-input" name="author" placeholder="Your Name" required />
                <input type="text" class="comment-input" name="role" placeholder="Your Title / Company (optional)" />
              </div>
              <textarea class="comment-textarea" name="text" placeholder="Share your perspective or analysis..." required></textarea>
              <button type="submit" class="btn btn-primary btn-sm comment-form-submit">
                Post Comment
              </button>
            </form>
          </div>
        </article>
      `;
    }).join("");
  }

  renderCommentsList(comments) {
    if (!comments || comments.length === 0) {
      return `<p style="font-size: 0.82rem; color: var(--text-muted); font-style: italic;">No comments yet. Be the first to share your perspective!</p>`;
    }

    return comments.map(c => {
      const initials = c.author.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
      return `
        <div class="comment-card">
          <div class="comment-header">
            <div class="comment-author-wrap">
              <div class="comment-avatar">${initials}</div>
              <div>
                <span class="comment-author-name">${c.author}</span>
                ${c.role ? `<span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 6px;">• ${c.role}</span>` : ''}
              </div>
            </div>
            <span class="comment-time">${c.time}</span>
          </div>
          <p class="comment-body">${c.text}</p>
        </div>
      `;
    }).join("");
  }

  toggleComments(ideaId) {
    const drawer = document.getElementById(`comments-drawer-${ideaId}`);
    if (drawer) {
      drawer.classList.toggle("expanded");
    }
  }

  vote(ideaId, choice) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (idea.userVote === choice) {
      // Toggle off
      idea.poll[choice]--;
      idea.userVote = null;
    } else {
      if (idea.userVote) {
        // Switch choice
        idea.poll[idea.userVote]--;
      }
      idea.poll[choice]++;
      idea.userVote = choice;
      window.app && window.app.showToast(`Feedback recorded: ${choice === 'agree' ? 'Agreed' : 'Disagreed'} with thesis`, "emerald");
    }

    this.saveState();
    this.renderIdeas();
  }

  react(ideaId, reactionType) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (!idea.userReactions) idea.userReactions = {};

    if (idea.userReactions[reactionType]) {
      idea.reactions[reactionType]--;
      idea.userReactions[reactionType] = false;
    } else {
      idea.reactions[reactionType]++;
      idea.userReactions[reactionType] = true;
    }

    this.saveState();
    this.renderIdeas();
  }

  submitComment(event, ideaId) {
    event.preventDefault();
    const form = event.target;
    const author = form.author.value.trim();
    const role = form.role.value.trim();
    const text = form.text.value.trim();

    if (!author || !text) return;

    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: author,
      role: role || "Engineering Leader",
      time: "Just now",
      text: text
    };

    idea.comments.unshift(newComment);
    this.saveState();
    this.renderIdeas();

    // Re-open comments drawer for immediate feedback
    setTimeout(() => {
      const drawer = document.getElementById(`comments-drawer-${ideaId}`);
      if (drawer) drawer.classList.add("expanded");
    }, 50);

    window.app && window.app.showToast("Comment successfully submitted", "blue");
  }
}
