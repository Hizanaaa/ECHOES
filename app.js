// ── Configuration ──────────────────────────────────────────────────────────
// API key lives in server.py — this file is safe to share publicly.

const EMOTION_CONFIG = {
  joy:          { color: "#f0c060", icon: "ti-sun",        label: "Joy" },
  sadness:      { color: "#58a6ff", icon: "ti-cloud-rain", label: "Sadness" },
  anger:        { color: "#f87171", icon: "ti-flame",      label: "Anger" },
  fear:         { color: "#c084fc", icon: "ti-eye-off",    label: "Fear" },
  surprise:     { color: "#34d399", icon: "ti-bolt",       label: "Surprise" },
  disgust:      { color: "#fb923c", icon: "ti-mood-sad",   label: "Disgust" },
  trust:        { color: "#67e8f9", icon: "ti-shield",     label: "Trust" },
  anticipation: { color: "#a78bfa", icon: "ti-rocket",     label: "Anticipation" },
};

const SAMPLES = [
  "Today was one of those days that started with such promise but slowly unraveled. I woke up hopeful, made coffee, sat by the window watching the rain. But the meeting didn't go well — I stumbled over my words, felt the eyes in the room shift away. Now I'm home, exhausted, wondering if I belong in this field at all. Yet somehow, deep inside, I know tomorrow might be different.",
  "My fellow citizens, we stand at a crossroads. The enemy within — complacency, division, fear — threatens to undo everything generations before us sacrificed to build. But I say to you today: we will not yield. We have faced darkness before, and we have always, always found our way back to the light. The struggle is real, the stakes are high, and the time for action is NOW.",
  "I think about you in the quiet hours, when the world has gone still and there is nothing between us but distance and memory. You are the kind of warmth that stays long after the fire is out. I don't know how to say what you mean to me — only that every ordinary morning is extraordinary when I imagine sharing it with you.",
  "After six years, I've decided it's time to move on. This wasn't an easy decision — this company gave me my first real chance, and for that I'll always be grateful. But I've realized I've been shrinking myself to fit a space that no longer suits me. I owe it to myself to find out what I'm really capable of. I'm ready.",
];

const LOADING_MSGS = [
  "Reading between the lines...",
  "Decoding emotional signatures...",
  "Mapping the inner landscape...",
  "Consulting the neural oracle...",
];

let radarChart = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function loadSample(i) {
  document.getElementById("ml-text").value = SAMPLES[i];
}

function setLoading(on) {
  document.getElementById("loading").classList.toggle("hidden", !on);
  document.getElementById("analyze-btn").disabled = on;
}

function showResults(show) {
  document.getElementById("results").classList.toggle("hidden", !show);
}

// ── Analyze ────────────────────────────────────────────────────────────────

async function analyze() {
  const text = document.getElementById("ml-text").value.trim();
  if (!text) return;

  showResults(false);
  setLoading(true);

  let msgIdx = 0;
  const msgEl = document.getElementById("loading-text");
  const msgTimer = setInterval(() => {
    msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
    msgEl.textContent = LOADING_MSGS[msgIdx];
  }, 1800);

  try {
    const result = await callBackend(text);
    renderResults(result);
    showResults(true);
  } catch (err) {
    console.error("Analysis error:", err);
    msgEl.textContent = "Analysis failed — is server.py running? Check the terminal.";
    await new Promise(r => setTimeout(r, 3000));
  } finally {
    clearInterval(msgTimer);
    setLoading(false);
  }
}

// ── Backend call (goes to your local Flask server) ─────────────────────────

async function callBackend(text) {
  const response = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) throw new Error(`Server error: ${response.status}`);

  const data = await response.json();
  return JSON.parse(data.result);
}

// ── Render results ─────────────────────────────────────────────────────────

function renderResults(r) {
  renderDominantBadge(r.dominant);
  renderEmotionGrid(r.emotions);
  renderRadar(r.emotions);
  renderMeta(r);
  document.getElementById("insight-text").textContent = r.insight;
}

function renderDominantBadge(dominant) {
  const cfg = EMOTION_CONFIG[dominant] || EMOTION_CONFIG.joy;
  const el = document.getElementById("dominant-badge");
  el.innerHTML = `<i class="ti ${cfg.icon}" aria-hidden="true"></i> ${cfg.label}`;
  el.style.background = cfg.color + "22";
  el.style.color = cfg.color;
  el.style.border = `0.5px solid ${cfg.color}55`;
}

function renderEmotionGrid(emotions) {
  const grid = document.getElementById("emotion-grid");
  grid.innerHTML = "";
  const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([key, val]) => {
    const cfg = EMOTION_CONFIG[key];
    const pct = Math.round(val);
    const card = document.createElement("div");
    card.className = "emotion-card";
    card.innerHTML = `
      <i class="ti ${cfg.icon} emotion-icon" aria-hidden="true" style="color:${cfg.color}"></i>
      <div class="emotion-name">${cfg.label}</div>
      <div class="emotion-pct" style="color:${cfg.color}">${pct}%</div>
      <div class="emotion-bar">
        <div class="emotion-fill" style="background:${cfg.color}" data-target="${pct}"></div>
      </div>
    `;
    grid.appendChild(card);
  });

  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll(".emotion-fill").forEach(el => {
        el.style.width = el.dataset.target + "%";
      });
    }, 50);
  });
}

function renderRadar(emotions) {
  const sorted = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([k]) => EMOTION_CONFIG[k].label);
  const values = sorted.map(([, v]) => Math.round(v));
  const colors = sorted.map(([k]) => EMOTION_CONFIG[k].color);

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(document.getElementById("ml-radar"), {
    type: "radar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: "rgba(88,166,255,0.10)",
        borderColor: "#58a6ff",
        borderWidth: 1.5,
        pointBackgroundColor: colors,
        pointBorderColor: colors,
        pointRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, color: "#484f58", font: { size: 11 }, backdropColor: "transparent" },
          grid: { color: "#21262d" },
          angleLines: { color: "#21262d" },
          pointLabels: { color: "#7d8590", font: { size: 12 } },
        },
      },
    },
  });
}

function renderMeta(r) {
  const SENTIMENT_COLORS = { Positive: "#34d399", Negative: "#f87171", Mixed: "#f0c060", Neutral: "#7d8590" };
  const sentColor = SENTIMENT_COLORS[r.sentiment] || "#e6edf3";

  document.getElementById("meta-grid").innerHTML = `
    <div class="meta-card">
      <div class="meta-label">Sentiment</div>
      <div class="meta-val" style="color:${sentColor}">${r.sentiment}</div>
    </div>
    <div class="meta-card">
      <div class="meta-label">Intensity</div>
      <div class="meta-val">${Math.round(r.intensity)}<span>/10</span></div>
    </div>
    <div class="meta-card">
      <div class="meta-label">Complexity</div>
      <div class="meta-val">${Math.round(r.complexity)}<span>/10</span></div>
    </div>
  `;
}