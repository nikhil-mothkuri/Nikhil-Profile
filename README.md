# Nikhil Mothkuri — Portfolio

> Lead Software Architect & AI Systems Specialist at JPMorgan Chase & Co.  
> Former Senior Infrastructure & Cloud Architect at Dell Technologies (Ireland), Oracle, and Infosys.

An executive portfolio engineered with Apple Human Interface Guidelines and modern web standards. Built with vanilla HTML5, CSS3, and modern JavaScript for instant performance, 60fps physics animations, and zero framework overhead.

---

## 🌟 Key Features

- **Apple Design Language**:
  - **Apple Light Pro (Default)**: Clean minimalist Cupertino canvas (`#fbfbfd`), frosted glass layers (`backdrop-filter: blur(20px)`), and Apple system accents.
  - **Space Black Mode**: Layered OLED dark surfaces with zero neon bloom.
  - **Seamless Theme Toggle**: Instant switching with persistent `localStorage` preference and zero flash of unstyled content (FOUC).
- **Interactive Career Transit Map**:
  - Vector transit map inspired by Apple Maps Transit rendering stations across JPMorgan Chase, Dell Technologies, Oracle, and Infosys.
  - Interactive line filtering (Distributed Systems, AI & Intelligent Systems, Leadership).
  - Dynamic Station Dossier panel highlighting system metrics, milestones, and architectural impact.
- **Spotlight Command Palette (`⌘K` / `Ctrl+K`)**:
  - Native macOS Spotlight search palette with instant navigation, action shortcuts, and appearance toggle.
- **Keynote Bento Showcase**:
  - Apple Music-style ambient focus player.
  - Apple Watch activity ring widget tracking uptime, availability, and weekend cricket metrics.
  - Curated systems literature shelf.
- **Executive Brief & Clean Printable CV**:
  - Quick-pitch modal for engineering leadership and strategic technology advisory.
  - 1-click formatted printable CV ready for export or review.
- **In-Page Admin Editor & 1-Click GitHub Publisher**:
  - Discreet authenticated admin mode on `nikhilai.in` via GitHub Personal Access Token (`⌘K` → Admin Login, or `#admin`).
  - Visual inline click-to-edit for hero text, bio, and status.
  - Structured Inspector modal for managing Career Metro stations, skills, perspectives, and bento items.
  - 1-click GitHub API commit that directly updates `js/data.js` on `main`, automatically triggering live deployment via GitHub Pages.

---

## 🛠️ Architecture & Stack

- **Markup**: Semantic HTML5 with SVG icon sets (no emoji UI chrome).
- **Styling**: Modular CSS3 using CSS Custom Properties (Tokens), CSS Grid, and Apple squircle geometry.
  - `css/variables.css` — Theme tokens, typography, and optical shadow definitions.
  - `css/base.css` — Reset, canvas, and typography hierarchy.
  - `css/components.css` — Frosted navbar, buttons, theme toggle, and modals.
  - `css/hero.css` — Keynote hero and metrics ribbon.
  - `css/metro-map.css` — Transit map vectors and dossier layout.
  - `css/ideas.css` — Perspectives and community voting engine.
  - `css/bento.css` — Bento widgets and timeline.
  - `css/resume-modal.css` — Executive brief and print stylesheet.
- **JavaScript**: Modular vanilla ES6+ engine:
  - `js/data.js` — Single source of truth for career timeline and competencies.
  - `js/metro-map.js` — Dynamic SVG transit vector renderer.
  - `js/command-palette.js` — Spotlight keyboard controller.
  - `js/ideas.js` — Perspective poll and discussion drawer.
  - `js/bento.js` — Audio and interactive widgets.
  - `js/resume-modal.js` — Printable resume builder.
  - `js/main.js` — Application orchestrator and ThemeManager.

---

## 🚀 Running Locally

No build tools or heavy dependencies required. Simply open `index.html` in any modern web browser or serve via any static HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js npx
npx serve .
```

Then visit `http://localhost:8000` in your browser.

---

## 📬 Contact & Links

- **LinkedIn**: [nikhil-mothkuri-a3887747](https://www.linkedin.com/in/nikhil-mothkuri-a3887747/)
- **GitHub**: [nikhil-mothkuri](https://github.com/nikhil-mothkuri)
- **Email**: nikhilvce@gmail.com

