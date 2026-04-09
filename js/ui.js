// UI Manager — DOM manipulation. Scenario-agnostic.

import { state, setCallbacks, resetState, drawChaosCard as engineDrawCard, approveProposal as engineApprove, approveAll as engineApproveAll, dismissProposals as engineDismiss, setPriority as engineSetPriority } from './engine.js';
import { initRenderer, resizeCanvas, renderFrame, spawnAlert, reinitAMRs } from './renderer.js';
import { initMesh, drawMesh } from './mesh.js';
import { sfxApprove } from './audio.js';

const el = id => document.getElementById(id);
const qsa = sel => document.querySelectorAll(sel);

export function initUI() {
  setCallbacks({
    onLog, onKPIUpdate, onHudUpdate,
    onChaosCard: renderChaosCard,
    onProposals: renderProposals,
    onDismissProposals: () => { el('proposals-section').style.display = 'none'; },
    onGameOver, onTimerUpdate,
    onToast: showToast,
    onSpawnAlert: sid => spawnAlert(sid),
  });

  initRenderer(el('factory-canvas'), el('factory-area'));
  initMesh(el('mesh-canvas'));

  // Globals for onclick in HTML
  window.startGame = startGame;
  window.drawChaosCard = () => engineDrawCard();
  window.toggleMesh = toggleMesh;
  window.toggleLog = toggleLog;
  window.setPriority = m => { engineSetPriority(m); qsa('.priority-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === m)); };
  window.approveProposal = i => engineApprove(i);
  window.approveAll = () => engineApproveAll();
  window.dismissProposals = () => engineDismiss();
  window.shareScore = shareScore;

  document.addEventListener('keydown', onKeyDown);
}

function startGame() {
  resetState();
  el('chaos-card-slot').innerHTML = '<p style="color:var(--fg-d);font-size:0.8125rem;padding:16px 0;text-align:center;">No active event</p>';
  el('proposals-section').style.display = 'none';
  el('log-body').innerHTML = '';
  el('deck-count').textContent = state.chaosDeck.length;
  qsa('.priority-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'speed'));

  const sc = state.scenario;
  const label = el('kpi-unit-label');
  if (label && sc) {
    const p = sc.unitNamePlural || 'Units';
    label.textContent = p.charAt(0).toUpperCase() + p.slice(1);
  }

  el('intro-screen').classList.remove('visible');
  el('gameover-screen').classList.remove('visible');
  el('app').style.display = 'grid';

  resizeCanvas();
  reinitAMRs();
  state.running = true;
  state.animFrame = requestAnimationFrame(renderFrame);
}

function toggleMesh() {
  state.meshVisible = !state.meshVisible;
  el('mesh-overlay').classList.toggle('visible', state.meshVisible);
  if (state.meshVisible) drawMesh();
}

function toggleLog() {
  state.logVisible = !state.logVisible;
  el('event-log').classList.toggle('visible', state.logVisible);
}

function onLog(time, topic, message) {
  if (!time) {
    const elapsed = (state.scenario?.gameDuration || 300) - state.timeLeft;
    time = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(Math.floor(elapsed % 60)).padStart(2, '0');
  }
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `<span class="log-time">${time}</span><span class="log-topic">${topic}</span><span>${message}</span>`;
  el('log-body').prepend(entry);
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
  state.stations.forEach(s => { if (s.status === 'green') g++; else if (s.status === 'yellow') y++; else r++; });
  el('hud-online').textContent = g;
  el('hud-warning').textContent = y;
  el('hud-down').textContent = r;
  el('deck-count').textContent = state.chaosDeck.length;
}

function onTimerUpdate(str) { el('timer-display').textContent = str; }

function renderChaosCard(card) {
  el('chaos-card-slot').innerHTML = `
    <div class="chaos-card severity-${card.severity}">
      <div class="card-title">${card.title}</div>
      <div class="card-desc">${card.desc}</div>
      <div style="font-size:0.6875rem;color:var(--fg-d);margin-top:8px;">Agents: ${card.agents.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ')}</div>
    </div>`;
}

function renderProposals(proposals) {
  el('proposals-section').style.display = 'block';
  el('proposals-slot').innerHTML = proposals.map((p, i) => `
    <div class="proposal" onclick="approveProposal(${i})">
      <div class="agent">${p.agentId}</div>
      <div class="action">${p.action}</div>
      <div class="tags">${(p.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>`).join('');
}

function onGameOver({ grade, title, score }) {
  sfxApprove();
  el('app').style.display = 'none';
  el('final-grade').textContent = grade;
  el('final-title').textContent = title;
  const sc = state.scenario;
  const unit = sc?.unitNamePlural || 'units';
  el('final-stats').innerHTML = `
    <div class="final-stat"><div class="val">${Math.floor(state.unitsProduced)}</div><div class="lbl">${unit}</div></div>
    <div class="final-stat"><div class="val">${Math.round(state.otif)}%</div><div class="lbl">OTIF</div></div>
    <div class="final-stat"><div class="val">$${Math.round(state.margin).toLocaleString()}</div><div class="lbl">Margin</div></div>
    <div class="final-stat"><div class="val">${state.defectRate.toFixed(1)}%</div><div class="lbl">Defects</div></div>
    <div class="final-stat"><div class="val">${state.energy.toFixed(1)}</div><div class="lbl">kWh</div></div>
    <div class="final-stat"><div class="val">${Math.round(score)}</div><div class="lbl">Score</div></div>`;
  el('gameover-screen').classList.add('visible');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

function shareScore() {
  const sc = state.scenario;
  const text = `Dark Shift: ${Math.round(state.score)} pts (${el('final-grade').textContent}) — ${Math.floor(state.unitsProduced)} ${sc?.unitNamePlural || 'units'}, ${Math.round(state.otif)}% OTIF`;
  navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
}

function onKeyDown(e) {
  if (!state.running) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startGame(); } return; }
  switch (e.key) {
    case 'c': case 'C': engineDrawCard(); break;
    case 'm': case 'M': toggleMesh(); break;
    case 'l': case 'L': toggleLog(); break;
    case '1': window.setPriority('speed'); break;
    case '2': window.setPriority('margin'); break;
    case '3': window.setPriority('quality'); break;
    case '4': window.setPriority('green'); break;
    case 'a': case 'A': if (state.proposals.length) engineApproveAll(); break;
  }
}

window.addEventListener('resize', () => { if (state.running) { resizeCanvas(); reinitAMRs(); } });
