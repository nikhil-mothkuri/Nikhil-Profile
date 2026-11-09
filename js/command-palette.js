/* ===================================================================
   COMMAND PALETTE CONTROLLER (CMD+K / CTRL+K)
   macOS Spotlight Navigation & Action Controller
   =================================================================== */

class CommandPaletteEngine {
  constructor() {
    this.modal = document.getElementById("cmd-palette-modal");
    this.input = document.getElementById("cmd-search-input");
    this.resultsList = document.getElementById("cmd-results-list");
    this.selectedIndex = 0;

    this.commands = [
      { id: "metro", title: "Career Experience & Architecture Milestones", category: "Navigation", icon: "›", action: () => this.scrollTo("career-metro") },
      { id: "ideas", title: "Insights & Technical Perspectives", category: "Insights", icon: "›", action: () => this.scrollTo("thought-radar") },
      { id: "about", title: "About & Core Competencies", category: "Navigation", icon: "›", action: () => this.scrollTo("about") },
      { id: "education", title: "Academic Foundations & Certifications", category: "Navigation", icon: "›", action: () => this.scrollTo("education") },
      { id: "bento", title: "Personal Craft, Books & Disciplines", category: "Interests", icon: "›", action: () => this.scrollTo("hobbies") },
      { id: "endorsements", title: "Testimonials from Engineering Leaders", category: "Testimonials", icon: "›", action: () => this.scrollTo("endorsements") },
      { id: "recruiter", title: "Executive Summary Brief", category: "Overview", icon: "›", action: () => window.resumeModal.openPitchModal() },
      { id: "resume", title: "Print or Export Curriculum Vitae", category: "Document", icon: "›", action: () => window.resumeModal.openResumeModal() },
      { id: "theme", title: "Toggle Appearance (Light / Dark Mode)", category: "Appearance", icon: "›", action: () => window.themeManager.toggle() },
      { id: "admin", title: "Admin Login & Content Editor", category: "Admin", icon: "›", action: () => window.adminManager.handleTriggerClick() },
      { id: "copy-email", title: "Copy Email (nikhilvce@gmail.com)", category: "Action", icon: "›", action: () => this.copyEmail() },
      { id: "contact", title: "Get in Touch / Book Advisory", category: "Contact", icon: "›", action: () => this.scrollTo("contact") }
    ];

    this.filteredCommands = [...this.commands];
    this.init();
  }

  init() {
    if (!this.modal || !this.input) return;

    // Global Key Listener
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.open();
      } else if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    // Modal Trigger Buttons
    document.querySelectorAll(".cmd-k-trigger").forEach(btn => {
      btn.addEventListener("click", () => this.open());
    });

    // Close button & overlay click
    const closeBtn = document.getElementById("cmd-palette-close");
    if (closeBtn) closeBtn.addEventListener("click", () => this.close());

    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) this.close();
    });

    // Search input typing
    this.input.addEventListener("input", () => {
      this.filter(this.input.value);
    });

    // Keyboard navigation in list
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.executeCurrent();
      }
    });
  }

  open() {
    this.modal.classList.add("active");
    this.input.value = "";
    this.filter("");
    setTimeout(() => this.input.focus(), 60);
  }

  close() {
    this.modal.classList.remove("active");
  }

  isOpen() {
    return this.modal.classList.contains("active");
  }

  filter(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.title.toLowerCase().includes(q) || cmd.category.toLowerCase().includes(q)
      );
    }
    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    if (this.filteredCommands.length === 0) {
      this.resultsList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.88rem;">No matching sections found.</div>`;
      return;
    }

    this.resultsList.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div class="cmd-item ${idx === this.selectedIndex ? 'selected' : ''}" data-idx="${idx}">
        <div class="cmd-item-left">
          <span style="color: var(--apple-blue); font-weight: 600;">${cmd.icon}</span>
          <span style="font-weight: 500;">${cmd.title}</span>
        </div>
        <span class="cmd-item-badge">${cmd.category}</span>
      </div>
    `).join("");

    this.resultsList.querySelectorAll(".cmd-item").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.getAttribute("data-idx"), 10);
        this.selectedIndex = idx;
        this.executeCurrent();
      });
    });
  }

  navigate(dir) {
    if (this.filteredCommands.length === 0) return;
    this.selectedIndex = (this.selectedIndex + dir + this.filteredCommands.length) % this.filteredCommands.length;
    this.renderResults();
  }

  executeCurrent() {
    const cmd = this.filteredCommands[this.selectedIndex];
    if (cmd && cmd.action) {
      this.close();
      cmd.action();
    }
  }

  scrollTo(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  copyEmail() {
    navigator.clipboard.writeText("nikhilvce@gmail.com").then(() => {
      window.app && window.app.showToast("Email address copied to clipboard", "blue");
    });
  }
}
