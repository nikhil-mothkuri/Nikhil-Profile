/* ===================================================================
   MAIN APPLICATION ORCHESTRATOR
   Scrollspy, Skills Matrix, Modals, Toasts & Contact Handling
   =================================================================== */

class PortfolioApp {
  constructor() {
    this.toastContainer = document.getElementById("toast-container");
    this.init();
  }

  init() {
    this.initHeaderScroll();
    this.initScrollspy();
    this.initMobileMenu();
    this.initSkillMatrix();
    this.initEducationTimeline();
    this.initEndorsements();
    this.initContactForm();
    this.initBackToTop();
  }

  /* Header Scroll Glow */
  initHeaderScroll() {
    const header = document.querySelector(".site-header");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  /* Navigation Scrollspy */
  initScrollspy() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {
      let currentId = "";
      const scrollPos = window.scrollY + 180;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentId = section.getAttribute("id");
        }
      });

      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentId}`) {
          link.classList.add("active");
        }
      });
    });
  }

  /* Mobile Hamburger Menu */
  initMobileMenu() {
    const toggle = document.querySelector(".mobile-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (toggle && navLinks) {
      toggle.addEventListener("click", () => {
        navLinks.classList.toggle("open");
      });

      navLinks.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("open");
        });
      });
    }
  }

  /* Interactive Skill Matrix with Category Tabs */
  initSkillMatrix() {
    const tabsContainer = document.getElementById("skill-category-tabs");
    const gridContainer = document.getElementById("skills-grid-container");

    if (!tabsContainer || !gridContainer) return;

    const categories = [
      { id: "all", label: "All Capabilities" },
      { id: "systems", label: "Distributed Systems" },
      { id: "ai", label: "AI & Intelligent Systems" },
      { id: "leadership", label: "Leadership & Architecture" }
    ];

    tabsContainer.innerHTML = categories.map((cat, idx) => `
      <button class="skill-tab-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat.id}">
        ${cat.label}
      </button>
    `).join("");

    const renderSkills = (catId) => {
      const skills = catId === "all" 
        ? PORTFOLIO_DATA.skills 
        : PORTFOLIO_DATA.skills.filter(s => s.category === catId);

      gridContainer.innerHTML = skills.map(skill => `
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-level-badge">${skill.level}% Proficiency</span>
          </div>
          <div class="skill-bar-wrap">
            <div class="skill-bar-fill" style="width: 0%" data-width="${skill.level}%"></div>
          </div>
          <p class="skill-proof"><strong>Impact:</strong> ${skill.proof}</p>
        </div>
      `).join("");

      // Trigger width animation
      setTimeout(() => {
        gridContainer.querySelectorAll(".skill-bar-fill").forEach(bar => {
          bar.style.width = bar.getAttribute("data-width");
        });
      }, 50);
    };

    renderSkills("all");

    tabsContainer.querySelectorAll(".skill-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        tabsContainer.querySelectorAll(".skill-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSkills(btn.getAttribute("data-cat"));
      });
    });
  }

  /* Education & Credentials Timeline */
  initEducationTimeline() {
    const container = document.getElementById("education-timeline-container");
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.education.map(item => `
      <div class="edu-timeline-item">
        <div class="edu-node-dot ${item.colorClass}">
          <div class="edu-inner-dot"></div>
        </div>
        <div class="edu-card">
          <div class="edu-header">
            <h3 class="edu-degree">${item.degree}</h3>
            <span class="edu-period">${item.period}</span>
          </div>
          <div class="edu-school">${item.school}</div>
          <p class="edu-details">${item.details}</p>
          <div class="edu-tags">
            ${item.tags.map(t => `<span class="edu-tag">${t}</span>`).join("")}
          </div>
        </div>
      </div>
    `).join("");
  }

  /* Endorsements / Testimonials */
  initEndorsements() {
    const container = document.getElementById("testimonials-grid-container");
    if (!container) return;

    container.innerHTML = PORTFOLIO_DATA.endorsements.map(end => `
      <div class="testimonial-card">
        <p class="testimonial-quote">${end.text}</p>
        <div class="testimonial-author">
          <div class="author-avatar">
            ${end.initials}
          </div>
          <div class="author-details">
            <div class="author-name">
              ${end.author} <span class="verified-badge" title="Verified Colleague">✓</span>
            </div>
            <div class="author-role">${end.role}</div>
          </div>
        </div>
      </div>
    `).join("");
  }

  /* Contact Form Handler */
  initContactForm() {
    const form = document.getElementById("contact-inquiry-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `<span>Sending Message...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();
        this.showToast("Message sent. Nikhil will follow up shortly.", "blue");
      }, 700);
    });
  }

  /* Back to Top */
  initBackToTop() {
    const btn = document.getElementById("back-to-top-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* Global Toast Messenger (Apple iOS Notification / Dynamic Island) */
  showToast(message, type = "blue") {
    if (!this.toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    toast.innerHTML = `<span style="color: var(--apple-blue); font-weight: 600;">✓</span> <span>${message}</span>`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
}

/* ===================================================================
   THEME MANAGER (LIGHT / DARK APPEARANCE)
   Default: Apple Light Pro
   =================================================================== */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = "nikhil_portfolio_theme";
    this.toggleBtn = document.getElementById("theme-toggle-btn");
    this.init();
  }

  init() {
    let theme = "light";
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === "dark") {
        theme = "dark";
      }
    } catch (e) {
      theme = "light";
    }

    this.applyTheme(theme, false);

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener("click", () => {
        this.toggle();
      });
    }
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  applyTheme(theme, showToast = true) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {}

    // Update button attributes
    if (this.toggleBtn) {
      const nextTitle = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
      this.toggleBtn.setAttribute("title", nextTitle);
      this.toggleBtn.setAttribute("aria-label", nextTitle);
    }

    if (showToast && window.app && typeof window.app.showToast === "function") {
      const label = theme === "light" ? "Light Theme Activated" : "Dark Theme Activated";
      window.app.showToast(label);
    }
  }

  toggle() {
    const current = this.getCurrentTheme();
    const target = current === "dark" ? "light" : "dark";
    this.applyTheme(target, true);
  }
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PortfolioApp();
  window.themeManager = new ThemeManager();

  // Initialize Metro Map
  window.metroEngine = new MetroMapEngine(
    "career-metro-svg-container",
    "station-dossier-panel",
    PORTFOLIO_DATA.metroStations
  );

  // Initialize Ideas & Comment Radar
  window.ideasEngine = new IdeasEngine(
    "ideas-cards-grid",
    PORTFOLIO_DATA.ideas
  );

  // Initialize Bento life OS
  window.bentoEngine = new BentoEngine(PORTFOLIO_DATA.bento);

  // Initialize Command Palette
  window.cmdPalette = new CommandPaletteEngine();

  // Initialize Resume Modals
  window.resumeModal = new ResumeModalEngine(PORTFOLIO_DATA);
});
