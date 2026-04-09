// ─── Game Engine ────────────────────────────
// Scenario-agnostic game loop, state management,
// chaos deck, agent proposals, scoring.

import { sfxEvent, sfxApprove, sfxTick } from './audio.js';

// ─── State ──────────────────────────────────
export const state = {
  running: false,
  timeLeft: 300,
  score: 0,
  unitsProduced: 0,
  otif: 100,
  margin: 0,
  defectRate: 0.5,
  energy: 12.0,
  carbon: 3.2,
  priority: 'speed',
  animFrame: null,
  lastTick: 0,
  chaosDeck: [],
  chaosDrawn: 0,
  eventLog: [],
  activeEvent: null,
  proposals: [],
  stations: [],
  bikes: [],
  amrs: [],
  particles: [],
  meshVisible: false,
  logVisible: false,
  productionMultiplier: 1,
  costMultiplier: 1,
  qualityMultiplier: 1,
  energyMultiplier: 1,
  // Set by loadScenario
  scenario: null,
};

// Accumulators (not part of serialisable state)
let unitSpawnAccum = 0;
let chaosAutoTimer = 0;

// External callbacks — set by ui.js
let _onLog = () => {};
let _onKPIUpdate = () => {};
let _onHudUpdate = () => {};
let _onChaosCard = () => {};
let _onProposals = () => {};
let _onDismissProposals = () => {};
let _onGameOver = () => {};
let _onTimerUpdate = () => {};
let _onToast = () => {};
let _onSpawnAlert = () => {};

export function setCallbacks(cbs) {
  if (cbs.onLog) _onLog = cbs.onLog;
  if (cbs.onKPIUpdate) _onKPIUpdate = cbs.onKPIUpdate;
  if (cbs.onHudUpdate) _onHudUpdate = cbs.onHudUpdate;
  if (cbs.onChaosCard) _onChaosCard = cbs.onChaosCard;
  if (cbs.onProposals) _onProposals = cbs.onProposals;
  if (cbs.onDismissProposals) _onDismissProposals = cbs.onDismissProposals;
  if (cbs.onGameOver) _onGameOver = cbs.onGameOver;
  if (cbs.onTimerUpdate) _onTimerUpdate = cbs.onTimerUpdate;
  if (cbs.onToast) _onToast = cbs.onToast;
  if (cbs.onSpawnAlert) _onSpawnAlert = cbs.onSpawnAlert;
}

// ─── Scenario loading ───────────────────────
export function loadScenario(scenario) {
  state.scenario = scenario;
  state.timeLeft = scenario.gameDuration || 300;
}

// ─── Init / Reset ───────────────────────────
export function initStations() {
  state.stations = state.scenario.stations.map(d => ({
    ...d,
    status: 'green',
    throughput: 1.0,
    health: 100,
    glow: 0,
    alertTimer: 0,
  }));
}

export function initChaosDeck() {
  state.chaosDeck = [...state.scenario.chaosCards].sort(() => Math.random() - 0.5);
  state.chaosDrawn = 0;
}

function generateProposals(agents) {
  const responses = state.scenario.agentResponses;
  return agents.map(agentId => {
    const pool = responses[agentId] || responses['planner'] || [];
    const resp = pool[Math.floor(Math.random() * pool.length)];
    return { agentId, ...resp };
  });
}

// ─── Chaos ──────────────────────────────────
export function drawChaosCard() {
  if (!state.running) return;
  if (state.chaosDeck.length === 0) {
    _onToast('Chaos deck is empty!');
    return;
  }
  const card = state.chaosDeck.pop();
  state.chaosDrawn++;
  state.activeEvent = card;

  // Affect stations
  card.affects.forEach(sid => {
    const st = state.stations.find(s => s.id === sid);
    if (st) {
      if (card.severity === 'danger') {
        st.status = 'red'; st.throughput = 0.3; st.glow = 1;
      } else if (card.severity === 'warn') {
        st.status = 'yellow'; st.throughput = 0.6; st.glow = 0.7;
      } else {
        st.status = 'yellow'; st.throughput = 0.8; st.glow = 0.5;
      }
      st.alertTimer = 15;
    }
  });

  const proposals = generateProposals(card.agents);
  state.proposals = proposals;

  _onChaosCard(card);
  _onProposals(proposals);
  addLog('chaos', card.title);
  sfxEvent();
  card.affects.forEach(sid => _onSpawnAlert(sid));
  _onHudUpdate();
}

// ─── Proposals ──────────────────────────────
export function approveProposal(index) {
  const p = state.proposals[index];
  if (!p) return;
  applyImpact(p.impact);
  addLog(`agent/${p.agentId}`, p.action);
  sfxApprove();
  healStations(0.3);
  dismissProposals();
  _onHudUpdate();
}

export function approveAll() {
  state.proposals.forEach(p => {
    applyImpact(p.impact);
    addLog(`agent/${p.agentId}`, p.action);
  });
  sfxApprove();
  healStations(0.2);
  dismissProposals();
  _onHudUpdate();
}

export function dismissProposals() {
  state.proposals = [];
  _onDismissProposals();
}

function healStations(amount) {
  state.stations.forEach(s => {
    if (s.status !== 'green') {
      s.throughput = Math.min(1, s.throughput + amount);
      if (s.throughput > 0.7) s.status = 'green';
      else if (s.throughput > 0.4) s.status = 'yellow';
    }
  });
}

function applyImpact(impact) {
  if (!impact) return;
  if (impact.output) state.productionMultiplier = Math.max(0.2, state.productionMultiplier + impact.output);
  if (impact.cost) state.margin -= impact.cost;
  if (impact.quality) state.qualityMultiplier = Math.max(0.5, state.qualityMultiplier + impact.quality);
  if (impact.otif) state.otif = Math.max(0, Math.min(100, state.otif + impact.otif));
  if (impact.energy) state.energyMultiplier = Math.max(0.3, state.energyMultiplier + impact.energy);
  if (impact.carbon) state.carbon = Math.max(0.5, state.carbon + impact.carbon);
}

// ─── Priority ───────────────────────────────
export function setPriority(mode) {
  state.priority = mode;
  const modes = state.scenario.priorityModes;
  if (modes && modes[mode]) {
    state.productionMultiplier = modes[mode].production;
    state.costMultiplier = modes[mode].cost;
    state.qualityMultiplier = modes[mode].quality;
    state.energyMultiplier = modes[mode].energy;
  }
  addLog('priority', `Mode changed to ${mode.toUpperCase()}`);
  sfxTick();
}

// ─── Event Log ──────────────────────────────
export function addLog(topic, message) {
  const elapsed = (state.scenario?.gameDuration || 300) - state.timeLeft;
  const min = Math.floor(elapsed / 60);
  const sec = Math.floor(elapsed % 60);
  const time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  state.eventLog.push({ time, topic, message });
  _onLog(time, topic, message);
}

// ─── Helpers ────────────────────────────────
export function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ─── Game Tick ──────────────────────────────
export function gameTick(dt) {
  const sc = state.scenario;
  if (!sc) return;

  // Timer
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endGame();
    return;
  }
  _onTimerUpdate(formatTime(state.timeLeft));

  // Unit production
  const avgThroughput = state.stations.reduce((a, s) => a + s.throughput, 0) / state.stations.length;
  unitSpawnAccum += dt * sc.productionRate * state.productionMultiplier * avgThroughput;
  let newUnits = 0;
  while (unitSpawnAccum >= 1) {
    unitSpawnAccum -= 1;
    newUnits++;
    state.unitsProduced += 1;
    state.margin += sc.marginPerUnit * state.costMultiplier * (state.priority === 'margin' ? 1.3 : 1);
  }

  // Station recovery
  state.stations.forEach(s => {
    if (s.alertTimer > 0) {
      s.alertTimer -= dt;
      if (s.alertTimer <= 0) {
        s.status = 'green';
        s.throughput = Math.min(1, s.throughput + 0.3);
        s.glow = 0;
      }
    }
    s.glow *= 0.99;
  });

  // Derived KPIs
  state.defectRate = Math.max(0.1, 5 - 4.5 * state.qualityMultiplier + (1 - avgThroughput) * 3);
  state.energy = Math.max(5, 12 * state.energyMultiplier);

  const downStations = state.stations.filter(s => s.status === 'red').length;
  if (downStations > 0) {
    state.otif = Math.max(0, state.otif - dt * downStations * 0.5);
  }

  // Score
  state.score = Math.round(
    state.unitsProduced * 10 +
    state.otif * 5 +
    state.margin * 0.01 +
    (100 - state.defectRate * 10) * 2 -
    state.energy * 2 -
    state.carbon * 5
  );

  // Auto chaos draw
  chaosAutoTimer += dt * 1000;
  const interval = sc.chaosIntervalMin + Math.random() * (sc.chaosIntervalMax - sc.chaosIntervalMin);
  if (chaosAutoTimer >= interval && state.chaosDeck.length > 0) {
    chaosAutoTimer = 0;
    drawChaosCard();
  }

  _onKPIUpdate();
  _onHudUpdate();

  return newUnits;
}

// ─── Start / End ────────────────────────────
export function resetState() {
  const sc = state.scenario;
  state.running = false;
  if (state.animFrame) cancelAnimationFrame(state.animFrame);

  state.timeLeft = sc?.gameDuration || 300;
  state.score = 0;
  state.unitsProduced = 0;
  state.otif = 100;
  state.margin = 0;
  state.defectRate = 0.5;
  state.energy = 12.0;
  state.carbon = 3.2;
  state.priority = 'speed';
  state.bikes = [];
  state.particles = [];
  state.eventLog = [];
  state.activeEvent = null;
  state.proposals = [];
  state.productionMultiplier = 1;
  state.costMultiplier = 1;
  state.qualityMultiplier = 1;
  state.energyMultiplier = 1;
  state.lastTick = 0;
  state.meshVisible = false;
  state.logVisible = false;
  unitSpawnAccum = 0;
  chaosAutoTimer = 0;

  initStations();
  initChaosDeck();
}

function endGame() {
  state.running = false;
  if (state.animFrame) cancelAnimationFrame(state.animFrame);

  const sc = state.scenario;
  let grade = 'D', title = 'Needs Training';
  for (const g of (sc?.grades || [])) {
    if (state.score >= g.minScore) {
      grade = g.grade;
      title = g.title;
      break;
    }
  }
  _onGameOver({ grade, title, score: state.score });
}

export function getGrade() {
  const sc = state.scenario;
  for (const g of (sc?.grades || [])) {
    if (state.score >= g.minScore) return g;
  }
  return { grade: 'D', title: 'Needs Training', minScore: 0 };
}
