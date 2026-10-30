/* ===================================================================
   RESUME & RECRUITER PITCH MODAL CONTROLLER
   Printable ATS-friendly view & 30-Second Executive Pitch
   =================================================================== */

class ResumeModalEngine {
  constructor(data) {
    this.data = data;
    this.pitchModal = document.getElementById("pitch-modal");
    this.resumeModal = document.getElementById("resume-modal");

    this.init();
  }

  init() {
    // Triggers
    document.querySelectorAll(".open-pitch-btn").forEach(btn => {
      btn.addEventListener("click", () => this.openPitchModal());
    });

    document.querySelectorAll(".open-resume-btn").forEach(btn => {
      btn.addEventListener("click", () => this.openResumeModal());
    });

    // Close buttons
    const pitchClose = document.getElementById("pitch-modal-close");
    if (pitchClose) pitchClose.addEventListener("click", () => this.closePitchModal());

    const resumeClose = document.getElementById("resume-modal-close");
    if (resumeClose) resumeClose.addEventListener("click", () => this.closeResumeModal());

    // Print Button
    const printBtn = document.getElementById("resume-print-action-btn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }

    // Overlay clicks
    if (this.pitchModal) {
      this.pitchModal.addEventListener("click", (e) => {
        if (e.target === this.pitchModal) this.closePitchModal();
      });
    }

    if (this.resumeModal) {
      this.resumeModal.addEventListener("click", (e) => {
        if (e.target === this.resumeModal) this.closeResumeModal();
      });
    }

    this.renderPrintableResume();
  }

  openPitchModal() {
    if (this.pitchModal) this.pitchModal.classList.add("active");
  }

  closePitchModal() {
    if (this.pitchModal) this.pitchModal.classList.remove("active");
  }

  openResumeModal() {
    if (this.resumeModal) this.resumeModal.classList.add("active");
  }

  closeResumeModal() {
    if (this.resumeModal) this.resumeModal.classList.remove("active");
  }

  renderPrintableResume() {
    const container = document.getElementById("printable-resume-sheet");
    if (!container) return;

    const p = this.data.profile;
    const stations = this.data.metroStations;
    const edu = this.data.education;

    container.innerHTML = `
      <div class="resume-sheet-header">
        <div>
          <h1 class="resume-sheet-name">${p.fullName}</h1>
          <div class="resume-sheet-role">${p.title}</div>
        </div>
        <div class="resume-sheet-contact">
          <div>${p.email}</div>
          <div>${p.location}</div>
          <div>LinkedIn: linkedin.com/in/nikhil-mothkuri-a3887747 • GitHub: github.com/nikhil-mothkuri</div>
        </div>
      </div>

      <div class="resume-sheet-section">
        <h2 class="resume-sheet-sec-title">Executive Summary</h2>
        <p style="font-size: 0.85rem; color: #334155; line-height: 1.55;">
          ${p.elevatorPitch} Proven track record scaling systems to 10M+ daily events, leading cross-functional engineering teams, and productionizing enterprise LLM and agentic workflows.
        </p>
      </div>

      <div class="resume-sheet-section">
        <h2 class="resume-sheet-sec-title">Core Competencies & Technologies</h2>
        <p style="font-size: 0.82rem; color: #334155; line-height: 1.6;">
          <strong>Languages & Frameworks:</strong> TypeScript, React, Next.js, Go, Python, Node.js, GraphQL, SQL.<br/>
          <strong>AI & Intelligent Systems:</strong> LLM Agent Orchestration, LangGraph, Vector Search (Qdrant), vLLM, TensorRT, Eval Guardrails.<br/>
          <strong>Distributed Systems & Cloud:</strong> AWS, GCP, Kubernetes, Docker, Kafka, PostgreSQL, ClickHouse, Redis, Terraform, CI/CD.<br/>
          <strong>Leadership:</strong> Tech Roadmap Strategy, RFC Architecture Reviews, Engineering Mentorship, Agile Sprint Cadence.
        </p>
      </div>

      <div class="resume-sheet-section">
        <h2 class="resume-sheet-sec-title">Professional Experience</h2>
        ${stations.map(st => `
          <div class="resume-sheet-entry">
            <div class="resume-sheet-entry-head">
              <span>${st.name}</span>
              <span>${st.period}</span>
            </div>
            <div class="resume-sheet-company">${st.company}</div>
            <ul class="resume-sheet-list">
              ${st.highlights.map(h => `<li>${h}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>

      <div class="resume-sheet-section">
        <h2 class="resume-sheet-sec-title">Education & Credentials</h2>
        ${edu.map(e => `
          <div class="resume-sheet-entry" style="margin-bottom: 8px;">
            <div class="resume-sheet-entry-head">
              <span>${e.degree}</span>
              <span>${e.period}</span>
            </div>
            <div class="resume-sheet-company">${e.school}</div>
            <p style="font-size: 0.8rem; color: #475569;">${e.details}</p>
          </div>
        `).join("")}
      </div>
    `;
  }
}
