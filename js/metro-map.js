/* ===================================================================
   INTERACTIVE CAREER METRO MAP ENGINE
   Apple Transit Vector Graph, Station Nodes & Dossier Controller
   =================================================================== */

class MetroMapEngine {
  constructor(containerId, dossierId, stationsData) {
    this.container = document.getElementById(containerId);
    this.dossierContainer = document.getElementById(dossierId);
    this.stations = stationsData;
    this.activeStationId = "station-5"; // Default to current role
    this.activeLine = "all";
    
    this.init();
  }

  init() {
    if (!this.container || !this.dossierContainer) return;
    this.renderSvgMap();
    this.attachFilterListeners();
    this.renderStationDossier(this.activeStationId);
  }

  renderSvgMap() {
    // Metro SVG viewBox: 0 0 900 460
    const svgHtml = `
      <svg viewBox="0 0 900 460" xmlns="http://www.w3.org/2000/svg" id="career-metro-svg">
        <defs>
          <!-- Subtle Transfer Line Gradients -->
          <linearGradient id="grad-systems-ai" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#2997ff" />
            <stop offset="100%" stop-color="#bf5af2" />
          </linearGradient>
          <linearGradient id="grad-ai-leadership" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#bf5af2" />
            <stop offset="100%" stop-color="#30d158" />
          </linearGradient>
        </defs>

        <!-- Metro Tracks (Smooth Bezier Curves) -->
        <!-- Background Guide Grid Lines -->
        <g class="metro-grid-guides">
          <line x1="80" y1="60" x2="80" y2="400" stroke="var(--svg-grid-line)" stroke-dasharray="4 4" />
          <line x1="250" y1="60" x2="250" y2="400" stroke="var(--svg-grid-line)" stroke-dasharray="4 4" />
          <line x1="440" y1="60" x2="440" y2="400" stroke="var(--svg-grid-line)" stroke-dasharray="4 4" />
          <line x1="620" y1="60" x2="620" y2="400" stroke="var(--svg-grid-line)" stroke-dasharray="4 4" />
          <line x1="780" y1="60" x2="780" y2="400" stroke="var(--svg-grid-line)" stroke-dasharray="4 4" />
        </g>

        <!-- Line 1: Systems Track (Apple Blue) -->
        <path id="track-systems-path" class="metro-line-track track-systems" data-line="systems"
          d="M 80,320 C 160,320 180,220 250,220 S 370,180 440,150 S 550,220 620,220 S 720,320 780,320" />

        <!-- Line 2: AI & Intelligent Systems Track (Apple Purple) -->
        <path id="track-ai-path" class="metro-line-track track-ai" data-line="ai"
          d="M 200,80 C 300,80 360,150 440,150 S 540,180 620,220 S 710,290 780,320" />

        <!-- Line 3: Leadership & Architecture Track (Apple Green) -->
        <path id="track-leadership-path" class="metro-line-track track-leadership" data-line="leadership"
          d="M 250,220 C 340,250 380,280 440,150 S 530,220 620,220 S 710,320 780,320" />

        <!-- Stations Render Group -->
        <g id="metro-stations-render-group">
          ${this.generateStationsSvg()}
        </g>
      </svg>
    `;

    this.container.innerHTML = svgHtml;
    this.attachStationClickHandlers();
  }

  generateStationsSvg() {
    return this.stations.map(st => {
      const isSelected = st.id === this.activeStationId;
      const isHub = st.isHub;

      let stationColor = "var(--line-systems)";
      if (st.track === "ai") stationColor = "var(--line-ai)";
      if (st.track === "leadership") stationColor = "var(--line-leadership)";
      if (isHub) stationColor = "var(--line-hub)";

      // Label positions offset
      const labelYOffset = st.svgPos.y > 200 ? -24 : 32;

      return `
        <g class="metro-station-group ${isSelected ? 'active' : ''}" 
           id="svg-${st.id}" 
           data-station-id="${st.id}" 
           data-line="${st.track}">
          
          <!-- Outer Ring for Selected / Hub -->
          ${isHub ? `
            <circle class="station-hub-outer" cx="${st.svgPos.x}" cy="${st.svgPos.y}" r="15" 
              fill="none" stroke="${stationColor}" stroke-width="1.5" opacity="0.5" />
          ` : ''}

          <!-- Selection Halo Ring -->
          <circle class="station-beacon" cx="${st.svgPos.x}" cy="${st.svgPos.y}" r="16" 
            fill="none" stroke="${stationColor}" stroke-width="2" opacity="0.8">
          </circle>

          <!-- Core Station Circle (Apple Map Pin Style) -->
          <circle class="station-circle" cx="${st.svgPos.x}" cy="${st.svgPos.y}" r="${isHub ? 9 : 7}" 
            fill="var(--bg-canvas)" stroke="${stationColor}" stroke-width="3" />
          
          <circle class="station-inner-dot" cx="${st.svgPos.x}" cy="${st.svgPos.y}" r="${isHub ? 4 : 3}" fill="var(--text-bright)" />

          <!-- Station Labels -->
          <text class="station-label" x="${st.svgPos.x}" y="${st.svgPos.y + labelYOffset}" text-anchor="middle">
            ${st.name}
          </text>
          <text class="station-year-label" x="${st.svgPos.x}" y="${st.svgPos.y + labelYOffset + (labelYOffset > 0 ? 14 : -12)}" text-anchor="middle">
            ${st.period} • ${st.company}
          </text>
        </g>
      `;
    }).join("");
  }

  attachStationClickHandlers() {
    const stationGroups = this.container.querySelectorAll(".metro-station-group");
    stationGroups.forEach(group => {
      group.addEventListener("click", () => {
        const stationId = group.getAttribute("data-station-id");
        this.selectStation(stationId);
      });
    });
  }

  selectStation(stationId) {
    this.activeStationId = stationId;

    // Update active class in SVG
    const allGroups = this.container.querySelectorAll(".metro-station-group");
    allGroups.forEach(g => {
      if (g.getAttribute("data-station-id") === stationId) {
        g.classList.add("active");
      } else {
        g.classList.remove("active");
      }
    });

    this.renderStationDossier(stationId);
  }

  attachFilterListeners() {
    const filterButtons = document.querySelectorAll(".metro-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const line = btn.getAttribute("data-line");
        this.filterLines(line);
      });
    });
  }

  filterLines(line) {
    this.activeLine = line;
    const tracks = this.container.querySelectorAll(".metro-line-track");
    const stationGroups = this.container.querySelectorAll(".metro-station-group");

    if (line === "all") {
      tracks.forEach(t => {
        t.classList.remove("dimmed");
        t.classList.remove("active-track");
      });
      stationGroups.forEach(g => g.classList.remove("dimmed"));
      return;
    }

    // Highlight specific track
    tracks.forEach(t => {
      if (t.getAttribute("data-line") === line) {
        t.classList.remove("dimmed");
        t.classList.add("active-track");
      } else {
        t.classList.add("dimmed");
        t.classList.remove("active-track");
      }
    });

    // Dim unrelated stations (keep hubs visible)
    stationGroups.forEach(g => {
      const stationLine = g.getAttribute("data-line");
      const stationId = g.getAttribute("data-station-id");
      const stData = this.stations.find(s => s.id === stationId);

      if (stationLine === line || (stData && stData.isHub)) {
        g.classList.remove("dimmed");
      } else {
        g.classList.add("dimmed");
      }
    });
  }

  renderStationDossier(stationId) {
    const station = this.stations.find(s => s.id === stationId);
    if (!station) return;

    let trackBadgeStyle = "background: rgba(41, 151, 255, 0.1); color: var(--apple-blue); border: 1px solid rgba(41, 151, 255, 0.25);";
    if (station.track === "ai") {
      trackBadgeStyle = "background: rgba(191, 90, 242, 0.1); color: var(--apple-purple); border: 1px solid rgba(191, 90, 242, 0.25);";
    } else if (station.track === "leadership") {
      trackBadgeStyle = "background: rgba(48, 209, 88, 0.1); color: var(--apple-green); border: 1px solid rgba(48, 209, 88, 0.25);";
    }

    const html = `
      <div class="dossier-header-bar">
        <div>
          <span class="dossier-track-badge" style="${trackBadgeStyle}">
            ${station.trackLabel}
          </span>
          <h3 class="dossier-role-title" style="margin-top: 10px;">${station.name}</h3>
          <p class="dossier-company">
            ${station.company} <span class="dossier-company-location">• Key Milestone</span>
          </p>
        </div>
        <span class="dossier-period">${station.period}</span>
      </div>

      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">
        ${station.mandate}
      </p>

      <div class="dossier-metrics-grid">
        ${station.metrics.map(m => `
          <div class="dossier-metric-item">
            <span class="dossier-metric-val">${m.val}</span>
            <span class="dossier-metric-lbl">${m.lbl}</span>
          </div>
        `).join("")}
      </div>

      <div>
        <h4 style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 12px; font-family: var(--font-mono); font-weight: 600;">
          Architecture &amp; Production Deliverables
        </h4>
        <ul class="dossier-highlights-list">
          ${station.highlights.map(h => `<li>${h}</li>`).join("")}
        </ul>
      </div>

      <div class="dossier-tech-tags">
        ${station.tags.map(t => `<span class="dossier-tag">${t}</span>`).join("")}
      </div>
    `;

    // Smooth transition
    this.dossierContainer.style.opacity = "0.3";
    setTimeout(() => {
      this.dossierContainer.innerHTML = html;
      this.dossierContainer.style.opacity = "1";
    }, 100);
  }
}
