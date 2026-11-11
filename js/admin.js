/* ===================================================================
   APPLE IN-PAGE ADMIN EDITOR & GITHUB PUBLISHER
   Live visual editor, structured data manager & 1-click GitHub commit
   =================================================================== */

class AdminManager {
  constructor() {
    this.STORAGE_TOKEN_KEY = "nikhil_admin_token";
    this.STORAGE_DRAFT_KEY = "nikhil_portfolio_draft";
    this.REPO_OWNER = "nikhil-mothkuri";
    this.REPO_NAME = "Nikhil-Profile";
    this.FILE_PATH = "js/data.js";
    this.BRANCH = "main";

    this.token = null;
    this.user = null;
    const baseSource = (typeof window !== "undefined" && window.PORTFOLIO_DATA) || 
                       (typeof PORTFOLIO_DATA !== "undefined" ? PORTFOLIO_DATA : {});
    this.data = JSON.parse(JSON.stringify(baseSource));
    this.isInlineEditing = false;
    this.hasUnsavedChanges = false;
    this.activeTab = "profile";

    this.init();
  }

  async init() {
    // Check for saved drafts
    this.loadDraftData();

    // Check Cloud Firestore for live dynamic portfolio data
    if (window.cmsService) {
      try {
        const liveData = await window.cmsService.getPortfolioData();
        if (liveData && liveData.profile) {
          this.data = Object.assign({}, this.data, liveData);
          if (typeof window !== "undefined" && window.PORTFOLIO_DATA) {
            Object.assign(window.PORTFOLIO_DATA, this.data);
          }
          this.refreshAllComponents();
        }
      } catch (e) {
        console.warn("Could not sync Firestore on init:", e);
      }
    }

    // Check Firebase Auth state
    if (window.firebaseService) {
      window.firebaseService.onAuthStateChanged(user => {
        if (user && window.firebaseService.isAdmin(user)) {
          this.firebaseUser = user;
          this.user = { name: user.displayName || "Nikhil", email: user.email };
          this.enableAdminMode(false);
        } else if (!this.token) {
          this.disableAdminMode();
        }
      });
    }

    // Check stored PAT token fallback
    const savedToken = localStorage.getItem(this.STORAGE_TOKEN_KEY);
    if (savedToken) {
      this.token = savedToken;
      const isValid = await this.validateToken(savedToken, false);
      if (isValid) {
        this.enableAdminMode(false);
      } else {
        localStorage.removeItem(this.STORAGE_TOKEN_KEY);
        this.token = null;
      }
    }

    this.attachDomListeners();
    this.checkUrlHash();
  }

  /* Load any unsaved draft data from localStorage */
  loadDraftData() {
    try {
      const draft = localStorage.getItem(this.STORAGE_DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object") {
          // Merge draft safely over this.data so missing sections are never lost
          this.data = Object.assign({}, this.data, parsed);
          if (parsed.profile) {
            this.data.profile = Object.assign({}, this.data.profile || {}, parsed.profile);
          }
          this.hasUnsavedChanges = true;
          if (typeof window !== "undefined" && window.PORTFOLIO_DATA) {
            Object.assign(window.PORTFOLIO_DATA, this.data);
          }
          this.refreshAllComponents();
        }
      }
    } catch (e) {
      console.warn("Could not load local draft:", e);
    }
  }

  /* Validate GitHub Personal Access Token */
  async validateToken(token, showToast = true) {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!res.ok) return false;
      const user = await res.json();
      this.user = user;

      // Also verify repository access
      const repoRes = await fetch(`https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!repoRes.ok) return false;
      const repoData = await repoRes.json();
      
      // Check write permissions
      if (repoData.permissions && !repoData.permissions.push) {
        if (showToast && window.app) window.app.showToast("Token does not have write permissions to this repository.", "orange");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Token validation error:", err);
      return false;
    }
  }

  /* Event Listeners */
  attachDomListeners() {
    // Admin Login Trigger in Footer
    const footerTrigger = document.getElementById("admin-login-trigger");
    if (footerTrigger) {
      footerTrigger.addEventListener("click", () => this.handleTriggerClick());
    }

    // Modal Close Buttons
    const loginClose = document.getElementById("admin-login-close");
    if (loginClose) loginClose.addEventListener("click", () => this.closeLoginModal());

    const editorClose = document.getElementById("admin-editor-close");
    if (editorClose) editorClose.addEventListener("click", () => this.closeEditorModal());

    // Password Toggle in Login
    const togglePwd = document.getElementById("admin-toggle-pwd");
    const pwdInput = document.getElementById("admin-password-input") || document.getElementById("admin-token-input");
    if (togglePwd && pwdInput) {
      togglePwd.addEventListener("click", () => {
        const type = pwdInput.getAttribute("type") === "password" ? "text" : "password";
        pwdInput.setAttribute("type", type);
        togglePwd.textContent = type === "password" ? "Show" : "Hide";
      });
    }

    // 1-Click Google Sign-In
    const googleBtn = document.getElementById("admin-google-btn");
    if (googleBtn) {
      googleBtn.addEventListener("click", async () => {
        const errorEl = document.getElementById("admin-login-error");
        if (errorEl) errorEl.style.display = "none";
        try {
          if (!window.firebaseService) throw new Error("Firebase service not initialized.");
          const res = await window.firebaseService.signInWithGoogle();
          if (res.user && window.firebaseService.isAdmin(res.user)) {
            this.firebaseUser = res.user;
            this.user = { name: res.user.displayName || "Nikhil", email: res.user.email };
            this.closeLoginModal();
            this.enableAdminMode(true);
          } else {
            if (errorEl) {
              errorEl.textContent = `Signed in as ${res.user.email}, but this account is not the designated admin (${window.firebaseService.adminEmail}).`;
              errorEl.style.display = "block";
            }
          }
        } catch (err) {
          if (errorEl) {
            errorEl.textContent = err.message;
            errorEl.style.display = "block";
          }
        }
      });
    }

    // Login Form Submit (Email & Password)
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this.handleLoginSubmit();
      });
    }

    // Alternate PAT Submit
    const patBtn = document.getElementById("admin-pat-submit-btn");
    if (patBtn) {
      patBtn.addEventListener("click", async () => {
        await this.handlePatLoginSubmit();
      });
    }

    // Floating HUD Buttons
    const hudEditBtn = document.getElementById("admin-hud-edit-btn");
    if (hudEditBtn) hudEditBtn.addEventListener("click", () => this.openEditorModal());

    const hudInlineBtn = document.getElementById("admin-hud-inline-btn");
    if (hudInlineBtn) hudInlineBtn.addEventListener("click", () => this.toggleInlineEditing());

    const hudPublishBtn = document.getElementById("admin-hud-publish-btn");
    if (hudPublishBtn) hudPublishBtn.addEventListener("click", () => this.handlePublishClick());

    const hudLogoutBtn = document.getElementById("admin-hud-logout-btn");
    if (hudLogoutBtn) hudLogoutBtn.addEventListener("click", () => this.logout());

    // Keyboard Shortcuts: Ctrl+Alt+A or ⌘+Option+A
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        this.handleTriggerClick();
      }
    });

    // Hash navigation
    window.addEventListener("hashchange", () => this.checkUrlHash());
  }

  checkUrlHash() {
    if (window.location.hash === "#admin") {
      this.handleTriggerClick();
    }
  }

  handleTriggerClick() {
    if (this.token && this.user) {
      this.openEditorModal();
    } else {
      this.openLoginModal();
    }
  }

  /* Login Flow */
  openLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.add("active");
      const input = document.getElementById("admin-token-input");
      if (input) setTimeout(() => input.focus(), 80);
    }
  }

  closeLoginModal() {
    const modal = document.getElementById("admin-login-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleLoginSubmit() {
    const emailInput = document.getElementById("admin-email-input");
    const pwdInput = document.getElementById("admin-password-input");
    const errorEl = document.getElementById("admin-login-error");
    const submitBtn = document.getElementById("admin-login-submit-btn");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = pwdInput ? pwdInput.value : "";

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = "Please enter both email and password.";
        errorEl.style.display = "block";
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Signing in...";
    }
    if (errorEl) errorEl.style.display = "none";

    try {
      if (window.firebaseService && window.firebaseService.isConfigured()) {
        const cred = await window.firebaseService.signInWithEmail(email, password);
        if (cred.user && window.firebaseService.isAdmin(cred.user)) {
          this.firebaseUser = cred.user;
          this.user = { name: cred.user.displayName || "Nikhil", email: cred.user.email };
          this.closeLoginModal();
          this.enableAdminMode(true);
        } else {
          throw new Error(`Signed in as ${cred.user.email}, but this account is not the designated admin.`);
        }
      } else {
        // Fallback demo/local admin mode
        if (email.toLowerCase() === "nikhilvce@gmail.com") {
          this.user = { name: "Nikhil Mothkuri", email: "nikhilvce@gmail.com" };
          this.closeLoginModal();
          this.enableAdminMode(true);
          if (window.app) {
            window.app.showToast("Admin Mode active. Configure keys in js/firebase-config.js for live cloud sync.", "emerald");
          }
        } else {
          throw new Error("Admin email must be nikhilvce@gmail.com");
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.style.display = "block";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Enter Admin Mode";
      }
    }
  }

  async handlePatLoginSubmit() {
    const input = document.getElementById("admin-token-input");
    const errorEl = document.getElementById("admin-login-error");
    if (!input || !input.value.trim()) return;
    const tokenVal = input.value.trim();
    const isValid = await this.validateToken(tokenVal, true);
    if (isValid) {
      this.token = tokenVal;
      localStorage.setItem(this.STORAGE_TOKEN_KEY, tokenVal);
      this.closeLoginModal();
      this.enableAdminMode(true);
    } else {
      if (errorEl) {
        errorEl.textContent = "Invalid token or missing write permissions.";
        errorEl.style.display = "block";
      }
    }
  }

  /* Enable Admin Mode & Surface HUD */
  enableAdminMode(showWelcomeToast = true) {
    const hud = document.getElementById("admin-floating-hud");
    if (hud) hud.classList.add("visible");

    this.updateHudStatus();

    if (showWelcomeToast && window.app) {
      const name = this.user ? (this.user.name || this.user.login) : "Nikhil";
      window.app.showToast(`Welcome back, ${name}! Admin Mode Active.`, "emerald");
    }
  }

  disableAdminMode() {
    if (this.isInlineEditing) this.toggleInlineEditing(false);
    const hud = document.getElementById("admin-floating-hud");
    if (hud) hud.classList.remove("visible");
  }

  async logout() {
    if (window.firebaseService) {
      await window.firebaseService.signOut();
    }
    this.firebaseUser = null;
    this.token = null;
    this.user = null;
    localStorage.removeItem(this.STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(this.STORAGE_TOKEN_KEY);

    this.disableAdminMode();
    this.closeEditorModal();

    if (window.app) window.app.showToast("Logged out of Admin Mode.", "blue");
  }

  /* Inline Visual Editing Mode */
  toggleInlineEditing(forceState = null) {
    this.isInlineEditing = forceState !== null ? forceState : !this.isInlineEditing;
    const hudBtn = document.getElementById("admin-hud-inline-btn");

    if (this.isInlineEditing) {
      document.body.classList.add("admin-editing-active");
      if (hudBtn) hudBtn.classList.add("active");
      this.attachInlineEditListeners();
      if (window.app) window.app.showToast("Visual Inline Edit Mode Active. Click any highlighted text to modify.", "blue");
    } else {
      document.body.classList.remove("admin-editing-active");
      if (hudBtn) hudBtn.classList.remove("active");
      this.detachInlineEditListeners();
      if (window.app) window.app.showToast("Visual Edit Mode Deactivated.", "blue");
    }
  }

  attachInlineEditListeners() {
    const editableElements = document.querySelectorAll("[data-editable]");
    editableElements.forEach(el => {
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");

      // Handle blur to save
      el.onblur = () => {
        const key = el.getAttribute("data-editable");
        const val = el.innerText.trim();
        this.setNestedValue(this.data, key, val);
        this.markUnsaved();
      };
    });
  }

  detachInlineEditListeners() {
    const editableElements = document.querySelectorAll("[data-editable]");
    editableElements.forEach(el => {
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
      el.onblur = null;
    });
  }

  /* Helper to set dot-notation paths on object */
  setNestedValue(obj, path, value) {
    const parts = path.split(".");
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
  }

  getNestedValue(obj, path) {
    const parts = path.split(".");
    let curr = obj;
    for (let i = 0; i < parts.length; i++) {
      if (curr === undefined || curr === null) return undefined;
      curr = curr[parts[i]];
    }
    return curr;
  }

  /* Mark Unsaved State */
  markUnsaved() {
    this.hasUnsavedChanges = true;
    try {
      localStorage.setItem(this.STORAGE_DRAFT_KEY, JSON.stringify(this.data));
    } catch (e) {}
    this.updateHudStatus();
  }

  updateHudStatus() {
    const statusDot = document.getElementById("admin-hud-dot");
    const statusText = document.getElementById("admin-hud-status-text");
    const publishBtn = document.getElementById("admin-hud-publish-btn");

    if (this.hasUnsavedChanges) {
      if (statusDot) statusDot.classList.add("unsaved");
      if (statusText) statusText.textContent = "Unsaved Draft";
      if (publishBtn) {
        publishBtn.classList.add("has-unsaved");
        publishBtn.innerHTML = `<span>☁ Publish to Live Site</span>`;
      }
    } else {
      if (statusDot) statusDot.classList.remove("unsaved");
      if (statusText) statusText.textContent = "Admin Active";
      if (publishBtn) {
        publishBtn.classList.remove("has-unsaved");
        publishBtn.innerHTML = `<span>✓ Up to Date</span>`;
      }
    }
  }

  /* Structured Editor Modal */
  openEditorModal(tab = "profile") {
    const modal = document.getElementById("admin-editor-modal");
    if (!modal) return;

    this.activeTab = tab;
    this.renderTabs();
    this.renderTabContent(this.activeTab);
    modal.classList.add("active");
  }

  closeEditorModal() {
    const modal = document.getElementById("admin-editor-modal");
    if (modal) modal.classList.remove("active");
  }

  renderTabs() {
    const tabs = [
      { id: "profile", label: "Profile & Hero" },
      { id: "metro", label: "Career Metro" },
      { id: "skills", label: "Technical Skills" },
      { id: "ideas", label: "Perspectives" },
      { id: "bento", label: "Bento & Personal" }
    ];

    const nav = document.getElementById("admin-tabs-nav");
    if (!nav) return;

    nav.innerHTML = tabs.map(t => `
      <button class="admin-tab-btn ${t.id === this.activeTab ? 'active' : ''}" data-tab="${t.id}">
        ${t.label}
      </button>
    `).join("");

    nav.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeTab = btn.getAttribute("data-tab");
        this.renderTabs();
        this.renderTabContent(this.activeTab);
      });
    });
  }

  renderTabContent(tab) {
    const container = document.getElementById("admin-tab-content-area");
    if (!container) return;

    if (tab === "profile") {
      this.renderProfileTab(container);
    } else if (tab === "metro") {
      this.renderMetroTab(container);
    } else if (tab === "skills") {
      this.renderSkillsTab(container);
    } else if (tab === "ideas") {
      this.renderIdeasTab(container);
    } else if (tab === "bento") {
      this.renderBentoTab(container);
    }
  }

  /* Profile Tab */
  renderProfileTab(container) {
    const p = this.data.profile || {};
    container.innerHTML = `
      <form id="admin-profile-form">
        <div class="admin-form-grid">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" name="fullName" value="${this.escapeHtml(p.fullName || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Executive Title</label>
            <input type="text" class="form-control" name="title" value="${this.escapeHtml(p.title || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-control" name="location" value="${this.escapeHtml(p.location || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" name="email" value="${this.escapeHtml(p.email || '')}" required>
          </div>
          <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input type="url" class="form-control" name="linkedin" value="${this.escapeHtml(p.linkedin || '')}">
          </div>
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input type="url" class="form-control" name="github" value="${this.escapeHtml(p.github || '')}">
          </div>
          <div class="form-group admin-form-full">
            <label class="form-label">Availability / Advisory Status Pill</label>
            <input type="text" class="form-control" name="availability" value="${this.escapeHtml(p.availability || '')}">
          </div>
          <div class="form-group admin-form-full">
            <label class="form-label">Hero Bio / Elevator Pitch</label>
            <textarea class="form-control" name="elevatorPitch" rows="4">${this.escapeHtml(p.elevatorPitch || '')}</textarea>
          </div>
        </div>

        <div class="admin-actions-bar">
          <button type="button" class="btn btn-secondary btn-sm" id="admin-reset-draft-btn">Reset to GitHub Version</button>
          <button type="submit" class="btn btn-primary btn-sm">Save &amp; Preview Changes</button>
        </div>
      </form>
    `;

    const form = document.getElementById("admin-profile-form");
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        for (const [k, v] of fd.entries()) {
          this.data.profile[k] = v;
        }
        this.markUnsaved();
        this.refreshProfileDOM();
        if (window.app) window.app.showToast("Profile details updated in live preview.", "emerald");
      };
    }

    const resetBtn = document.getElementById("admin-reset-draft-btn");
    if (resetBtn) {
      resetBtn.onclick = () => this.resetDraft();
    }
  }

  /* Metro Stations Tab */
  renderMetroTab(container) {
    const stations = this.data.metroStations || [];
    container.innerHTML = `
      <div class="admin-items-list">
        ${stations.map((st, idx) => `
          <div class="admin-item-card" data-station-index="${idx}">
            <div class="admin-item-header">
              <div class="admin-item-title">Station ${idx + 1}: ${this.escapeHtml(st.name)} (${this.escapeHtml(st.company)})</div>
              <span class="dossier-track-badge" style="background: var(--apple-blue-subtle); color: var(--apple-blue);">
                ${this.escapeHtml(st.period)}
              </span>
            </div>
            <div class="admin-form-grid">
              <div class="form-group">
                <label class="form-label">Role Title</label>
                <input type="text" class="form-control" data-st-field="name" value="${this.escapeHtml(st.name)}">
              </div>
              <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="form-control" data-st-field="company" value="${this.escapeHtml(st.company)}">
              </div>
              <div class="form-group">
                <label class="form-label">Period / Tenure</label>
                <input type="text" class="form-control" data-st-field="period" value="${this.escapeHtml(st.period)}">
              </div>
              <div class="form-group">
                <label class="form-label">Transit Track</label>
                <select class="form-control" data-st-field="track">
                  <option value="systems" ${st.track === 'systems' ? 'selected' : ''}>Distributed Systems Line (Blue)</option>
                  <option value="ai" ${st.track === 'ai' ? 'selected' : ''}>AI & Intelligent Systems (Purple)</option>
                  <option value="leadership" ${st.track === 'leadership' ? 'selected' : ''}>Leadership & Architecture (Green)</option>
                </select>
              </div>
              <div class="form-group admin-form-full">
                <label class="form-label">Architectural Mandate</label>
                <textarea class="form-control" data-st-field="mandate" rows="2">${this.escapeHtml(st.mandate || '')}</textarea>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="admin-actions-bar">
        <button type="button" class="btn btn-secondary btn-sm" id="admin-add-station-btn">+ Add Career Station</button>
        <button type="button" class="btn btn-primary btn-sm" id="admin-save-stations-btn">Apply &amp; Redraw Metro Map</button>
      </div>
    `;

    document.getElementById("admin-add-station-btn").onclick = () => {
      const newStation = {
        id: `station-${stations.length + 1}`,
        name: "New Architectural Role",
        company: "Organization Name",
        period: "2026",
        track: "systems",
        trackLabel: "Architecture Track",
        color: "var(--line-systems)",
        isHub: false,
        svgPos: { x: 700, y: 250 },
        mandate: "High-level architectural impact and technical responsibility.",
        metrics: [{ val: "100%", lbl: "Impact" }],
        highlights: ["Designed and executed critical engineering roadmaps."],
        tags: ["Architecture", "Leadership"]
      };
      this.data.metroStations.push(newStation);
      this.renderMetroTab(container);
      this.markUnsaved();
    };

    document.getElementById("admin-save-stations-btn").onclick = () => {
      const cards = container.querySelectorAll(".admin-item-card");
      cards.forEach(card => {
        const idx = parseInt(card.getAttribute("data-station-index"), 10);
        const st = this.data.metroStations[idx];
        if (st) {
          card.querySelectorAll("[data-st-field]").forEach(input => {
            const field = input.getAttribute("data-st-field");
            st[field] = input.value;
          });
        }
      });

      this.markUnsaved();
      if (window.metroEngine) {
        window.metroEngine.stations = this.data.metroStations;
        window.metroEngine.renderSvgMap();
        window.metroEngine.renderStationDossier(window.metroEngine.activeStationId);
      }
      if (window.app) window.app.showToast("Metro Map updated with new station data.", "emerald");
    };
  }

  /* Skills Matrix Tab */
  renderSkillsTab(container) {
    const skills = this.data.skills || [];
    container.innerHTML = `
      <div class="admin-items-list">
        ${skills.map((sk, idx) => `
          <div class="admin-item-card" data-skill-index="${idx}">
            <div class="admin-item-header">
              <div class="admin-item-title">${this.escapeHtml(sk.name)} (${sk.level}%)</div>
              <button type="button" class="btn btn-secondary btn-sm admin-remove-skill-btn" data-index="${idx}" style="color: var(--apple-red); padding: 2px 8px; font-size: 0.72rem;">Remove</button>
            </div>
            <div class="admin-form-grid">
              <div class="form-group">
                <label class="form-label">Capability Name</label>
                <input type="text" class="form-control" data-sk-field="name" value="${this.escapeHtml(sk.name)}">
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-control" data-sk-field="category">
                  <option value="systems" ${sk.category === 'systems' ? 'selected' : ''}>Distributed Systems</option>
                  <option value="ai" ${sk.category === 'ai' ? 'selected' : ''}>AI & Intelligent Systems</option>
                  <option value="leadership" ${sk.category === 'leadership' ? 'selected' : ''}>Leadership & Architecture</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Mastery Level (0 - 100)</label>
                <input type="number" min="50" max="100" class="form-control" data-sk-field="level" value="${sk.level || 90}">
              </div>
              <div class="form-group admin-form-full">
                <label class="form-label">Production Proof / Impact Statement</label>
                <input type="text" class="form-control" data-sk-field="proof" value="${this.escapeHtml(sk.proof || '')}">
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="admin-actions-bar">
        <button type="button" class="btn btn-secondary btn-sm" id="admin-add-skill-btn">+ Add Skill</button>
        <button type="button" class="btn btn-primary btn-sm" id="admin-save-skills-btn">Apply &amp; Re-render Matrix</button>
      </div>
    `;

    container.querySelectorAll(".admin-remove-skill-btn").forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute("data-index"), 10);
        this.data.skills.splice(idx, 1);
        this.renderSkillsTab(container);
        this.markUnsaved();
      };
    });

    document.getElementById("admin-add-skill-btn").onclick = () => {
      this.data.skills.push({
        id: `skill-${Date.now()}`,
        name: "New Technology or Architecture Domain",
        category: "systems",
        level: 90,
        proof: "Led enterprise implementation and performance optimization."
      });
      this.renderSkillsTab(container);
      this.markUnsaved();
    };

    document.getElementById("admin-save-skills-btn").onclick = () => {
      const cards = container.querySelectorAll(".admin-item-card");
      cards.forEach(card => {
        const idx = parseInt(card.getAttribute("data-skill-index"), 10);
        const sk = this.data.skills[idx];
        if (sk) {
          card.querySelectorAll("[data-sk-field]").forEach(input => {
            const field = input.getAttribute("data-sk-field");
            if (field === "level") sk[field] = parseInt(input.value, 10);
            else sk[field] = input.value;
          });
        }
      });

      this.markUnsaved();
      if (window.app) {
        window.app.initSkillMatrix();
        window.app.showToast("Skills matrix re-rendered successfully.", "emerald");
      }
    };
  }

  /* Ideas / Perspectives Tab */
  renderIdeasTab(container) {
    const ideas = this.data.ideas || [];
    container.innerHTML = `
      <div class="admin-items-list">
        ${ideas.map((idea, idx) => `
          <div class="admin-item-card" data-idea-index="${idx}">
            <div class="admin-item-header">
              <div class="admin-item-title">${this.escapeHtml(idea.title.slice(0, 50))}...</div>
              <span class="category-tag ${idea.category}">${this.escapeHtml(idea.categoryLabel || idea.category)}</span>
            </div>
            <div class="admin-form-grid">
              <div class="form-group admin-form-full">
                <label class="form-label">Article / Perspective Title</label>
                <input type="text" class="form-control" data-id-field="title" value="${this.escapeHtml(idea.title)}">
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-control" data-id-field="category">
                  <option value="ai" ${idea.category === 'ai' ? 'selected' : ''}>AI & Architecture</option>
                  <option value="systems" ${idea.category === 'systems' ? 'selected' : ''}>Distributed Systems</option>
                  <option value="leadership" ${idea.category === 'leadership' ? 'selected' : ''}>Tech Leadership</option>
                  <option value="hottake" ${idea.category === 'hottake' ? 'selected' : ''}>Edge AI / Hot Take</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Conviction Score (%)</label>
                <input type="number" min="50" max="100" class="form-control" data-id-field="conviction" value="${idea.conviction || 85}">
              </div>
              <div class="form-group admin-form-full">
                <label class="form-label">Core Thesis Summary</label>
                <textarea class="form-control" data-id-field="summary" rows="3">${this.escapeHtml(idea.summary || '')}</textarea>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="admin-actions-bar">
        <button type="button" class="btn btn-secondary btn-sm" id="admin-add-idea-btn">+ Add Perspective</button>
        <button type="button" class="btn btn-primary btn-sm" id="admin-save-ideas-btn">Apply &amp; Re-render Perspectives</button>
      </div>
    `;

    document.getElementById("admin-add-idea-btn").onclick = () => {
      this.data.ideas.push({
        id: `idea-${Date.now()}`,
        title: "New Architectural Thesis or Emerging Technology Perspective",
        category: "ai",
        categoryLabel: "AI & Architecture",
        horizon: "Horizon: 2026 - 2028",
        conviction: 85,
        convictionLabel: "High Conviction (85%)",
        summary: "Clear executive thesis on system evolution, trade-offs, and future trajectories.",
        bullets: [
          "First critical architectural insight and trade-off analysis.",
          "Second measurable outcome or industry pattern observation."
        ],
        poll: { agree: 50, disagree: 5 },
        reactions: { fire: 20, mindblown: 35, insight: 40, bullish: 15 },
        comments: []
      });
      this.renderIdeasTab(container);
      this.markUnsaved();
    };

    document.getElementById("admin-save-ideas-btn").onclick = () => {
      const cards = container.querySelectorAll(".admin-item-card");
      cards.forEach(card => {
        const idx = parseInt(card.getAttribute("data-idea-index"), 10);
        const id = this.data.ideas[idx];
        if (id) {
          card.querySelectorAll("[data-id-field]").forEach(input => {
            const field = input.getAttribute("data-id-field");
            if (field === "conviction") {
              id[field] = parseInt(input.value, 10);
              id.convictionLabel = `Conviction (${id.conviction}%)`;
            } else {
              id[field] = input.value;
            }
          });
        }
      });

      this.markUnsaved();
      if (window.ideasEngine) {
        window.ideasEngine.ideas = this.data.ideas;
        window.ideasEngine.renderIdeas();
      }
      if (window.app) window.app.showToast("Perspectives updated in live preview.", "emerald");
    };
  }

  /* Bento Tab */
  renderBentoTab(container) {
    const b = this.data.bento || {};
    const audio = b.audio || {};
    const fitness = b.fitness || {};

    container.innerHTML = `
      <div class="admin-form-grid">
        <div class="form-group admin-form-full">
          <label class="form-label">Focus Audio Session Title</label>
          <input type="text" class="form-control" id="admin-audio-track" value="${this.escapeHtml(audio.track || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Audio Artist / Session Name</label>
          <input type="text" class="form-control" id="admin-audio-artist" value="${this.escapeHtml(audio.artist || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Audio Genre</label>
          <input type="text" class="form-control" id="admin-audio-genre" value="${this.escapeHtml(audio.genre || '')}">
        </div>
        <div class="form-group admin-form-full">
          <label class="form-label">Cricket & Fitness Mindset</label>
          <textarea class="form-control" id="admin-fitness-mindset" rows="2">${this.escapeHtml(fitness.mindset || '')}</textarea>
        </div>
      </div>

      <div class="admin-actions-bar">
        <button type="button" class="btn btn-primary btn-sm" id="admin-save-bento-btn">Save Bento Updates</button>
      </div>
    `;

    document.getElementById("admin-save-bento-btn").onclick = () => {
      this.data.bento.audio.track = document.getElementById("admin-audio-track").value;
      this.data.bento.audio.artist = document.getElementById("admin-audio-artist").value;
      this.data.bento.audio.genre = document.getElementById("admin-audio-genre").value;
      this.data.bento.fitness.mindset = document.getElementById("admin-fitness-mindset").value;

      this.markUnsaved();
      if (window.app) window.app.showToast("Bento widgets updated in live preview.", "emerald");
    };
  }

  /* Reset local draft and restore from repository */
  resetDraft() {
    if (confirm("Discard all unpublished drafts and restore original content from GitHub?")) {
      localStorage.removeItem(this.STORAGE_DRAFT_KEY);
      const baseSource = (typeof window !== "undefined" && window.PORTFOLIO_DATA) || 
                         (typeof PORTFOLIO_DATA !== "undefined" ? PORTFOLIO_DATA : {});
      this.data = JSON.parse(JSON.stringify(baseSource));
      this.hasUnsavedChanges = false;
      this.refreshAllComponents();
      this.updateHudStatus();
      this.closeEditorModal();
      if (window.app) window.app.showToast("Draft discarded. Reset to latest GitHub version.", "blue");
    }
  }

  /* Refresh DOM with active profile data */
  refreshProfileDOM() {
    const p = this.data.profile || {};
    const headline = document.querySelector(".hero-headline");
    const bio = document.querySelector(".hero-bio");
    const supertag = document.querySelector(".hero-supertag span");
    const brandName = document.querySelector(".brand-logo span:first-child");

    if (supertag && p.title) supertag.textContent = p.title;
    if (bio && p.elevatorPitch) {
      bio.innerHTML = `Hi, I'm <strong>${this.escapeHtml(p.fullName)}</strong>. ${this.escapeHtml(p.elevatorPitch)}`;
    }
    if (brandName && p.fullName) brandName.textContent = p.fullName.toUpperCase();
  }

  refreshAllComponents() {
    this.refreshProfileDOM();
    if (window.metroEngine) {
      window.metroEngine.stations = this.data.metroStations;
      window.metroEngine.renderSvgMap();
      window.metroEngine.renderStationDossier(window.metroEngine.activeStationId);
    }
    if (window.app && typeof window.app.initSkillMatrix === "function") {
      window.app.initSkillMatrix();
    }
    if (window.ideasEngine) {
      window.ideasEngine.ideas = this.data.ideas;
      window.ideasEngine.renderIdeas();
    }
  }

  /* ===================================================================
     DYNAMIC CLOUD & GITHUB PUBLISHER
     Saves directly to Cloud Firestore or commits via GitHub API
     =================================================================== */
  async handlePublishClick() {
    if (!this.token && !this.firebaseUser && !this.user) {
      this.openLoginModal();
      return;
    }

    const publishBtn = document.getElementById("admin-hud-publish-btn");
    if (publishBtn) {
      publishBtn.disabled = true;
      publishBtn.innerHTML = `<span>Saving changes...</span>`;
    }

    // Ensure this.data retains all structural sections before saving
    const baseData = (typeof window !== "undefined" && window.PORTFOLIO_DATA) || 
                     (typeof PORTFOLIO_DATA !== "undefined" ? PORTFOLIO_DATA : {});
    const mergedData = Object.assign({}, baseData, this.data);
    if (baseData.profile && this.data.profile) {
      mergedData.profile = Object.assign({}, baseData.profile, this.data.profile);
    }
    this.data = mergedData;

    // 1. Try Firebase Cloud Firestore live save first (Instant, $0 cost, no git commit needed)
    if (window.cmsService && window.firebaseService && window.firebaseService.isConfigured()) {
      try {
        await window.cmsService.savePortfolioData(this.data);
        this.hasUnsavedChanges = false;
        localStorage.removeItem(this.STORAGE_DRAFT_KEY);
        this.updateHudStatus();

        if (publishBtn) {
          publishBtn.disabled = false;
          publishBtn.innerHTML = `<span>Save &amp; Publish</span>`;
        }

        if (window.app) {
          window.app.showToast("Saved dynamically to Cloud Firestore! Live immediately.", "emerald");
        }
        return;
      } catch (err) {
        console.warn("Firestore save error, falling back to GitHub/Local:", err);
      }
    }

    // 2. If no GitHub token available, save draft locally
    if (!this.token) {
      localStorage.setItem(this.STORAGE_DRAFT_KEY, JSON.stringify(this.data));
      this.hasUnsavedChanges = false;
      this.updateHudStatus();
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = `<span>Save &amp; Publish</span>`;
      }
      if (window.app) {
        window.app.showToast("Saved locally. Enter your Firebase project keys in js/firebase-config.js to sync live to cloud.", "blue");
      }
      return;
    }

    // 3. Fallback to GitHub Commit API
    const defaultMsg = `Update site content via Admin Editor (${new Date().toLocaleDateString()})`;
    const commitMsg = prompt("Enter commit message for GitHub deployment:", defaultMsg);
    if (!commitMsg) {
      if (publishBtn) {
        publishBtn.disabled = false;
        publishBtn.innerHTML = `<span>Save &amp; Publish</span>`;
      }
      return;
    }

    if (publishBtn) {
      publishBtn.innerHTML = `<span>Uploading to GitHub...</span>`;
    }

    try {
      // 1. Fetch current file SHA
      const getRes = await fetch(`https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.FILE_PATH}?ref=${this.BRANCH}`, {
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github+json"
        }
      });

      if (!getRes.ok) {
        throw new Error(`Failed to fetch current file SHA (HTTP ${getRes.status})`);
      }

      const fileMeta = await getRes.json();
      const currentSha = fileMeta.sha;

      // Ensure this.data retains all structural sections before publishing
      const baseData = (typeof window !== "undefined" && window.PORTFOLIO_DATA) || 
                       (typeof PORTFOLIO_DATA !== "undefined" ? PORTFOLIO_DATA : {});
      const mergedData = Object.assign({}, baseData, this.data);
      if (baseData.profile && this.data.profile) {
        mergedData.profile = Object.assign({}, baseData.profile, this.data.profile);
      }
      this.data = mergedData;

      // 2. Format JS code
      const jsCode = `/* ===================================================================
   DATA ARCHITECTURE & PORTFOLIO DATA STORE
   Nikhil Mothkuri's Professional Profile & Career Journey
   =================================================================== */

window.PORTFOLIO_DATA = ${JSON.stringify(this.data, null, 2)};
var PORTFOLIO_DATA = window.PORTFOLIO_DATA;
`;

      // 3. UTF-8 Safe Base64 Encoding
      const base64Content = btoa(unescape(encodeURIComponent(jsCode)));

      // 4. Issue PUT commit request
      const putRes = await fetch(`https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.FILE_PATH}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: commitMsg,
          content: base64Content,
          sha: currentSha,
          branch: this.BRANCH
        })
      });

      if (!putRes.ok) {
        const errorJson = await putRes.json();
        throw new Error(errorJson.message || `HTTP ${putRes.status}`);
      }

      // Success!
      this.hasUnsavedChanges = false;
      localStorage.removeItem(this.STORAGE_DRAFT_KEY);
      Object.assign(window.PORTFOLIO_DATA, this.data);
      this.updateHudStatus();

      if (publishBtn) {
        publishBtn.disabled = false;
      }

      if (window.app) {
        window.app.showToast("Changes pushed to GitHub! Live update deploying at nikhilai.in (~30s).", "emerald");
      }
    } catch (err) {
      console.error("Publishing error:", err);
      if (publishBtn) {
        publishBtn.disabled = false;
      }
      this.updateHudStatus();
      alert(`Publishing failed: ${err.message}\n\nPlease verify that your token has write permissions.`);
    }
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

// Global Registration
window.addEventListener("DOMContentLoaded", () => {
  window.adminManager = new AdminManager();
});

