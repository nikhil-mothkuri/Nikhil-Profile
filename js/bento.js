/* ===================================================================
   BENTO GRID: PERSONAL & CRAFT CONTROLLER
   Audio Player, Reading Shelf, and Activity Ring Progress
   =================================================================== */

class BentoEngine {
  constructor(data) {
    this.data = data;
    this.isPlayingAudio = false;
    this.audioInterval = null;
    this.audioContext = null;

    this.init();
  }

  init() {
    this.initAudioPlayer();
    this.initBookshelf();
    this.animateFitnessRing();
  }

  initAudioPlayer() {
    const playBtn = document.getElementById("audio-play-btn");
    const disk = document.getElementById("audio-disk");
    const equalizer = document.getElementById("audio-equalizer");

    if (!playBtn) return;

    playBtn.addEventListener("click", () => {
      this.isPlayingAudio = !this.isPlayingAudio;

      if (this.isPlayingAudio) {
        playBtn.innerHTML = `<span>⏸</span>`;
        if (disk) disk.classList.add("playing");
        if (equalizer) equalizer.classList.add("playing");
        this.startSynthwaveSound();
        window.app && window.app.showToast("Focus Audio: Playing ambient flow", "blue");
      } else {
        playBtn.innerHTML = `<span>▶</span>`;
        if (disk) disk.classList.remove("playing");
        if (equalizer) equalizer.classList.remove("playing");
        this.stopSynthwaveSound();
      }
    });
  }

  startSynthwaveSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, this.audioContext.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.03, this.audioContext.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start();
      this.currentOsc = osc;
      this.currentGain = gain;
    } catch (e) {
      console.log("Audio note:", e);
    }
  }

  stopSynthwaveSound() {
    if (this.currentGain && this.audioContext) {
      this.currentGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.5);
      setTimeout(() => {
        if (this.currentOsc) {
          this.currentOsc.stop();
          this.currentOsc.disconnect();
        }
      }, 500);
    }
  }

  initBookshelf() {
    const bookCards = document.querySelectorAll(".book-card");
    bookCards.forEach(card => {
      card.addEventListener("click", () => {
        const title = card.querySelector(".book-title")?.textContent;
        const takeaway = card.querySelector(".book-takeaway")?.textContent;
        window.app && window.app.showToast(`Key Takeaway: "${title}" — ${takeaway}`, "blue");
      });
    });
  }

  animateFitnessRing() {
    const ring = document.querySelector(".ring-progress");
    if (!ring) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ring.style.strokeDashoffset = "45"; // 80% complete
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(ring);
  }
}
