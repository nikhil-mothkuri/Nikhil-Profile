/* ===================================================================
   INTERACTIVE READER COMMENTS & DISCUSSION COMPONENT
   Supports:
   - Reader Email / Google Login with Firebase Auth
   - Live real-time comment threads
   - Moderation controls (Delete / Pin) for Admin
   =================================================================== */

class CommentsManager {
  constructor() {
    this.currentPostId = null;
    this.unsubscribeListener = null;
    this.currentUser = null;
    this.comments = [];
  }

  init(postId, containerId = "post-comments-container") {
    this.currentPostId = postId;
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Listen for Auth State changes
    if (window.firebaseService) {
      window.firebaseService.onAuthStateChanged(user => {
        this.currentUser = user;
        this.renderAuthBar();
      });
    }

    // Subscribe to live comments
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
    }

    this.renderSkeleton();

    if (window.cmsService) {
      this.unsubscribeListener = window.cmsService.subscribeComments(postId, (comments) => {
        this.comments = comments || [];
        this.renderCommentsList();
      });
    }
  }

  renderSkeleton() {
    this.container.innerHTML = `
      <section class="comments-section" id="comments-section">
        <div class="comments-header">
          <div class="comments-title-wrap">
            <h3 class="comments-title">
              <span>Discussion</span>
              <span class="comments-count-badge" id="comments-count-badge">0</span>
            </h3>
            <p class="comments-subtitle">Join the technical conversation. Share your perspectives and real-world experiences.</p>
          </div>
          <div class="comments-auth-status" id="comments-auth-status">
            <!-- Injected by renderAuthBar -->
          </div>
        </div>

        <!-- Comment Input Box -->
        <div class="comment-composer-card" id="comment-composer-card">
          <!-- Injected by renderComposer -->
        </div>

        <!-- Comments List -->
        <div class="comments-list" id="comments-list">
          <div class="comments-loading">Loading discussion...</div>
        </div>
      </section>
    `;

    this.renderAuthBar();
    this.renderComposer();
  }

  renderAuthBar() {
    const authStatus = document.getElementById("comments-auth-status");
    if (!authStatus) return;

    if (this.currentUser) {
      const isOwner = window.firebaseService ? window.firebaseService.isAdmin(this.currentUser) : false;
      authStatus.innerHTML = `
        <div class="comment-user-pill">
          <div class="comment-avatar-small">
            ${this.currentUser.photoURL 
              ? `<img src="${this.currentUser.photoURL}" alt="${this.escapeHtml(this.currentUser.displayName || '')}">`
              : `<span>${(this.currentUser.displayName || this.currentUser.email || "U").charAt(0).toUpperCase()}</span>`
            }
          </div>
          <div class="comment-user-info">
            <span class="comment-user-name">${this.escapeHtml(this.currentUser.displayName || this.currentUser.email.split('@')[0])}</span>
            ${isOwner ? `<span class="comment-badge-admin">Author</span>` : `<span class="comment-badge-reader">Reader</span>`}
          </div>
          <button class="comment-auth-action-btn" id="comment-logout-btn" title="Sign Out">Sign out</button>
        </div>
      `;

      const logoutBtn = document.getElementById("comment-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          if (window.firebaseService) await window.firebaseService.signOut();
        });
      }
    } else {
      authStatus.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="comment-login-trigger-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px;">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          Sign in to Comment
        </button>
      `;

      const loginTrigger = document.getElementById("comment-login-trigger-btn");
      if (loginTrigger) {
        loginTrigger.addEventListener("click", () => this.openReaderLoginModal());
      }
    }

    this.renderComposer();
  }

  renderComposer() {
    const composerCard = document.getElementById("comment-composer-card");
    if (!composerCard) return;

    if (this.currentUser) {
      composerCard.innerHTML = `
        <form id="comment-form" class="comment-form">
          <textarea 
            id="comment-textarea" 
            class="comment-textarea" 
            placeholder="Write your perspective or question... (Markdown supported)"
            rows="3" 
            required></textarea>
          <div class="comment-form-footer">
            <span class="comment-hint">Be respectful and constructive.</span>
            <button type="submit" class="btn btn-primary btn-sm" id="comment-submit-btn">
              <span>Post Comment</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      `;

      const form = document.getElementById("comment-form");
      if (form) {
        form.addEventListener("submit", (e) => this.handleCommentSubmit(e));
      }
    } else {
      composerCard.innerHTML = `
        <div class="comment-locked-banner">
          <div class="comment-locked-text">
            <strong>Have an insight to share?</strong>
            <span>Sign in with your email or Google account to join the discussion.</span>
          </div>
          <button class="btn btn-primary btn-sm" id="composer-login-btn">
            Sign In with Email / Google
          </button>
        </div>
      `;

      const btn = document.getElementById("composer-login-btn");
      if (btn) btn.addEventListener("click", () => this.openReaderLoginModal());
    }
  }

  async handleCommentSubmit(e) {
    e.preventDefault();
    const textarea = document.getElementById("comment-textarea");
    const submitBtn = document.getElementById("comment-submit-btn");
    if (!textarea || !textarea.value.trim()) return;

    const content = textarea.value.trim();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Posting...";
    }

    try {
      if (window.cmsService) {
        await window.cmsService.addComment(this.currentPostId, content, this.currentUser);
      }
      textarea.value = "";
      if (window.app && typeof window.app.showToast === "function") {
        window.app.showToast("Comment posted!", "emerald");
      }
    } catch (err) {
      console.error("Comment submit error:", err);
      alert(`Could not post comment: ${err.message}`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Post Comment</span>`;
      }
    }
  }

  renderCommentsList() {
    const list = document.getElementById("comments-list");
    const badge = document.getElementById("comments-count-badge");
    if (badge) badge.textContent = this.comments.length;
    if (!list) return;

    if (!this.comments.length) {
      list.innerHTML = `
        <div class="comments-empty">
          <div class="comments-empty-icon">💬</div>
          <p>No comments yet. Be the first to share your perspective!</p>
        </div>
      `;
      return;
    }

    const isCurrentAdmin = this.currentUser && window.firebaseService && window.firebaseService.isAdmin(this.currentUser);

    list.innerHTML = this.comments.map(c => {
      const isAuthor = c.isAdmin || (c.authorEmail && c.authorEmail.toLowerCase() === (window.firebaseService ? window.firebaseService.adminEmail.toLowerCase() : "nikhilvce@gmail.com"));
      const canDelete = isCurrentAdmin || (this.currentUser && (this.currentUser.uid === c.authorId || this.currentUser.email === c.authorEmail));
      const initials = (c.authorName || c.authorEmail || "U").charAt(0).toUpperCase();

      return `
        <article class="comment-item ${isAuthor ? 'comment-by-author' : ''}" id="comment-${c.id}">
          <div class="comment-item-avatar">
            ${c.authorPhoto 
              ? `<img src="${this.escapeHtml(c.authorPhoto)}" alt="${this.escapeHtml(c.authorName)}">` 
              : `<span>${initials}</span>`
            }
          </div>
          <div class="comment-item-body">
            <header class="comment-item-header">
              <div class="comment-item-meta">
                <span class="comment-item-name">${this.escapeHtml(c.authorName || 'Reader')}</span>
                ${isAuthor ? `<span class="comment-badge-admin">Author</span>` : ''}
                <span class="comment-item-date">${this.formatDate(c.createdAt)}</span>
              </div>
              ${canDelete ? `
                <button class="comment-delete-btn" data-comment-id="${c.id}" title="Delete comment">
                  ✕
                </button>
              ` : ''}
            </header>
            <div class="comment-item-content">
              ${this.formatContent(c.content)}
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Attach delete listeners
    list.querySelectorAll(".comment-delete-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-comment-id");
        if (confirm("Are you sure you want to delete this comment?")) {
          try {
            await window.cmsService.deleteComment(id, this.currentPostId);
            if (window.app && typeof window.app.showToast === "function") {
              window.app.showToast("Comment deleted", "blue");
            }
          } catch (err) {
            alert(`Could not delete comment: ${err.message}`);
          }
        }
      });
    });
  }

  /* Reader Login Modal Popup (Google & Email) */
  openReaderLoginModal() {
    let modal = document.getElementById("reader-auth-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "reader-auth-modal";
      modal.className = "modal-overlay";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="modal-box reader-auth-box">
          <button class="modal-close" id="reader-auth-close" aria-label="Close modal">✕</button>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div class="reader-auth-icon">💬</div>
            <h3 style="font-size: 1.4rem; color: var(--text-bright); margin-bottom: 6px;">Join the Discussion</h3>
            <p style="font-size: 0.88rem; color: var(--text-secondary);">
              Sign in with your email or Google to post your thoughts and reply to others.
            </p>
          </div>

          <!-- 1-Click Google Sign-In -->
          <button class="btn btn-secondary google-signin-btn" id="reader-google-btn" style="width: 100%; justify-content: center; gap: 10px; margin-bottom: 16px;">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div class="auth-divider">
            <span>or sign in with email</span>
          </div>

          <!-- Email / Password Form -->
          <form id="reader-email-form">
            <div class="form-group">
              <label class="form-label" for="reader-email-input">Email Address</label>
              <input type="email" id="reader-email-input" class="form-control" placeholder="you@domain.com" required autocomplete="email">
            </div>

            <div class="form-group" id="reader-name-group" style="display: none;">
              <label class="form-label" for="reader-name-input">Your Display Name</label>
              <input type="text" id="reader-name-input" class="form-control" placeholder="e.g. Alex Chen">
            </div>

            <div class="form-group">
              <label class="form-label" for="reader-password-input">Password</label>
              <input type="password" id="reader-password-input" class="form-control" placeholder="••••••••" required autocomplete="current-password">
            </div>

            <div id="reader-auth-error" class="auth-error-box" style="display: none;"></div>

            <button type="submit" class="btn btn-primary" id="reader-submit-btn" style="width: 100%; margin-top: 6px;">
              Sign In
            </button>
          </form>

          <div style="text-align: center; margin-top: 16px;">
            <button type="button" class="auth-mode-toggle-btn" id="reader-mode-toggle">
              Need an account? Sign up
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Event Listeners
      const closeBtn = document.getElementById("reader-auth-close");
      if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));

      const googleBtn = document.getElementById("reader-google-btn");
      if (googleBtn) {
        googleBtn.addEventListener("click", async () => {
          try {
            if (window.firebaseService) {
              await window.firebaseService.signInWithGoogle();
              modal.classList.remove("active");
            }
          } catch (err) {
            const errBox = document.getElementById("reader-auth-error");
            if (errBox) {
              errBox.textContent = err.message;
              errBox.style.display = "block";
            }
          }
        });
      }

      let isSignUp = false;
      const toggleMode = document.getElementById("reader-mode-toggle");
      const nameGroup = document.getElementById("reader-name-group");
      const submitBtn = document.getElementById("reader-submit-btn");

      if (toggleMode) {
        toggleMode.addEventListener("click", () => {
          isSignUp = !isSignUp;
          nameGroup.style.display = isSignUp ? "block" : "none";
          submitBtn.textContent = isSignUp ? "Create Account & Sign In" : "Sign In";
          toggleMode.textContent = isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up";
        });
      }

      const form = document.getElementById("reader-email-form");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = document.getElementById("reader-email-input").value;
          const password = document.getElementById("reader-password-input").value;
          const name = document.getElementById("reader-name-input").value;
          const errBox = document.getElementById("reader-auth-error");
          if (errBox) errBox.style.display = "none";

          try {
            if (window.firebaseService) {
              if (isSignUp) {
                await window.firebaseService.signUpWithEmail(email, password, name);
              } else {
                await window.firebaseService.signInWithEmail(email, password);
              }
              modal.classList.remove("active");
            }
          } catch (err) {
            if (errBox) {
              errBox.textContent = err.message;
              errBox.style.display = "block";
            }
          }
        });
      }
    }

    modal.classList.add("active");
  }

  /* Utility functions */
  formatDate(iso) {
    if (!iso) return "Just now";
    const date = new Date(iso);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  formatContent(text) {
    if (!text) return "";
    let safe = this.escapeHtml(text);
    // Simple inline code & linebreaks
    safe = safe.replace(/\n/g, "<br>");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
    return safe;
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
window.commentsManager = new CommentsManager();
