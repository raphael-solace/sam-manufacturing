// ─── UI Manager ─────────────────────────────
// DOM manipulation for game UI. Scenario-agnostic.

import { state, setCallbacks, resetState, drawChaosCard as engineDrawCard, approveProposal as engineApprove, approveAll as engineApproveAll, dismissProposals as engineDismiss, setPriority as engineSetPriority, formatTime } from './engine.js';
import { initRenderer, resizeCanvas, renderFrame, spawnAlert, reinitAMRs } from './renderer.js';
import { initMesh, drawMesh } from './mesh.js';
import { setSoundEnabled, isSoundEnabled, sfxApprove } from './audio.js';

// ─── DOM refs ───────────────────────────────
const el = id => document.getElementById(id);
const qsa = sel => document.querySelectorAll(sel);

// ─── Wire callbacks ─────────────────────────
export function initUI() {
  setCallbacks({
    onLog,
    onKPIUpdate,
    onHudUpdate,
    onChaosCard: renderChaosCard,
    onProposals: renderProposals,
    onDismissProposals: dismissProposalsUI,
    onGameOver,
    onTimerUpdate,
    onToast: showToast,
    onSpawnAlert: (sid) => spawnAlert(sid),
  });

  initRenderer(el('factory-canvas'), el('factory-area'));
  initMesh(el('mesh-canvas'));

  // Expose global handlers for onclick attributes in HTML
  window.startGame = startGame;
  window.drawChaosCard = () => engineDrawCard();
  window.toggleMesh = toggleMesh;
  window.toggleLog = toggleLog;
  window.toggleTheme = toggleTheme;
  window.toggleSound = toggleSound;
  window.setPriority = (m) => engineSetPriority(m);
  window.approveProposal = (i) => engineApprove(i);
  window.approveAll = () => engineApproveAll();
  window.dismissProposals = () => engineDismiss();
  window.shareScore = shareScore;

  // Keyboard shortcuts
  document.addEventListener('keydown', onKeyDown);
}

// ─── Game lifecycle ─────────────────────────
export function startGame() {
  resetState();

  // Reset UI
  el('chaos-card-slot').innerHTML = `<p style="color:var(--fg-3); font-size:var(--fs-sm); text-align:center; padding: 32px 0;">
    No active event<br><span style="font-size:var(--fs-xs);">Draw a card or wait for auto-draw</span></p>`;
  el('proposals-section').style.display = 'none';
  el('log-body').innerHTML = '';
  el('log-badge').style.display = 'none';
  el('deck-count').textContent = state.chaosDeck.length;
  qsa('.dial-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'speed'));

  // Update unit label from scenario
  const sc = state.scenario;
  const unitLabel = el('kpi-unit-label');
  if (unitLabel && sc) {
    const plural = sc.unitNamePlural || 'Units';
    unitLabel.textContent = plural.charAt(0).toUpperCase() + plural.slice(1) + ' Produced';
  }

  // Show app
  el('intro-screen').classList.remove('visible');
  el('gameover-screen').classList.remove('visible');
  el('app').style.display = 'grid';

  resizeCanvas();
  reinitAMRs();
  state.running = true;
  state.animFrame = requestAnimationFrame(renderFrame);

  onLog(null, 'system', `Night shift started. Survive ${Math.floor((sc?.gameDuration || 300) / 60)} minutes of chaos.`);
  showToast('Night shift begins. Good luck, GM.');
}

// ─── Theme / Sound ──────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
}

function toggleSound() {
  const on = !isSoundEnabled();
  setSoundEnabled(on);
  el('sound-btn')?.classList.toggle('active', on);
}

// ─── Mesh / Log toggles ────────────────────
function toggleMesh() {
  state.meshVisible = !state.meshVisible;
  el('mesh-overlay').classList.toggle('visible', state.meshVisible);
  if (state.meshVisible) drawMesh();
}

function toggleLog() {
  state.logVisible = !state.logVisible;
  el('event-log').classList.toggle('visible', state.logVisible);
}

// ─── Callbacks ──────────────────────────────
function onLog(time, topic, message) {
  if (!time) {
    const elapsed = (state.scenario?.gameDuration || 300) - state.timeLeft;
    const min = Math.floor(elapsed / 60);
    const sec = Math.floor(elapsed % 60);
    time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  const body = el('log-body');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">${time}</span><span class="log-topic">${topic}</span><span>${message}</span>`;
  body.prepend(entry);
  const badge = el('log-badge');
  badge.style.display = 'inline-grid';
  badge.textContent = state.eventLog.length;
}

function onKPIUpdate() {
  el('kpi-units').textContent = Math.floor(state.unitsProduced);
  el('kpi-otif').textContent = Math.round(state.otif);
  el('kpi-margin').textContent = '$' + Math.round(state.margin).toLocaleString();
  el('kpi-defect').textContent = state.defectRate.toFixed(1) + '%';
  el('kpi-energy').textContent = state.energy.toFixed(1);
  el('kpi-carbon').textContent = state.carbon.toFixed(1);
  el('kpi-score').textContent = Math.round(state.score);
}

function onHudUpdate() {
  let g = 0, y = 0, r = 0;
  state.stations.forEach(s => {
    if (s.status === 'green') g++;
    else if (s.status === 'yellow') y++;
    else r++;
  });
  el('hud-online').textContent = g;
  el('hud-warning').textContent = y;
  el('hud-down').textContent = r;
  el('deck-count').textContent = state.chaosDeck.length;
}

function onTimerUpdate(str) {
  el('timer-display').textContent = str;
}

function renderChaosCard(card) {
  const slot = el('chaos-card-slot');
  const sev = card.severity === 'danger' ? '' : card.severity === 'warn' ? 'warn' : 'info';
  slot.innerHTML = `
    <div class="chaos-card ${sev}">
      <div class="card-title">${card.title}</div>
      <div class="card-desc">${card.desc}</div>
      <div style="font-size:var(--fs-xs);color:var(--fg-3);">Agents: ${card.agents.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</div>
    </div>`;
}

function renderProposals(proposals) {
  el('proposals-section').style.display = 'block';
  el('proposals-slot').innerHTML = proposals.map((p, i) => `
    <div class="agent-proposal" onclick="approveProposal(${i})">
      <div class="agent-name">${p.agentId} Agent</div>
      <div class="agent-action">${p.action}</div>
      <div class="agent-impact">
        ${(p.tags || []).map(t => {
          const cls = t.startsWith('+') && !t.includes('$') ? 'positive' : t.startsWith('-') && !t.includes('$') ? 'negative' : 'neutral';
          return `<span class="impact-tag ${cls}">${t}</span>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function dismissProposalsUI() {
  el('proposals-section').style.display = 'none';
}

function onGameOver({ grade, title, score }) {
  sfxApprove();
  el('app').style.display = 'none';
  el('final-grade').textContent = grade;
  el('final-title').textContent = title;
  const sc = state.scenario;
  const unitLabel = sc?.unitNamePlural || 'Units';
  el('final-stats').innerHTML = `
    <div class="final-stat"><div class="val">${Math.floor(state.unitsProduced)}</div><div class="lbl">${unitLabel}</div></div>
    <div class="final-stat"><div class="val">${Math.round(state.otif)}%</div><div class="lbl">OTIF</div></div>
    <div class="final-stat"><div class="val">$${Math.round(state.margin).toLocaleString()}</div><div class="lbl">Margin</div></div>
    <div class="final-stat"><div class="val">${state.defectRate.toFixed(1)}%</div><div class="lbl">Defects</div></div>
    <div class="final-stat"><div class="val">${state.energy.toFixed(1)}</div><div class="lbl">kWh/unit</div></div>
    <div class="final-stat"><div class="val">${Math.round(score)}</div><div class="lbl">Score</div></div>`;
  el('gameover-screen').classList.add('visible');
}

// ─── Toast ──────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── Share ──────────────────────────────────
function shareScore() {
  const sc = state.scenario;
  const name = sc?.tagline || 'Dark Shift';
  const text = `I scored ${Math.round(state.score)} on ${name} (Grade: ${el('final-grade').textContent})! ${Math.floor(state.unitsProduced)} ${sc?.unitNamePlural || 'units'} produced, ${Math.round(state.otif)}% OTIF. #SolaceAgentMesh #DarkShift`;
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('Score copied to clipboard!'));
  }
}

// ─── Keyboard ───────────────────────────────
function onKeyDown(e) {
  if (!state.running) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame(); }
    return;
  }
  switch (e.key) {
    case 'c': case 'C': engineDrawCard(); break;
    case 'm': case 'M': toggleMesh(); break;
    case 'l': case 'L': toggleLog(); break;
    case '1': engineSetPriority('speed'); break;
    case '2': engineSetPriority('margin'); break;
    case '3': engineSetPriority('quality'); break;
    case '4': engineSetPriority('green'); break;
    case 'a': case 'A': if (state.proposals.length) engineApproveAll(); break;
  }
}

// ─── Resize ─────────────────────────────────
window.addEventListener('resize', () => {
  if (state.running) {
    resizeCanvas();
    reinitAMRs();
  }
});
