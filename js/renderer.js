// ─── Factory Floor Canvas Renderer ──────────
// Reads stations from engine state. Scenario-agnostic.

import { state, gameTick } from './engine.js';

let canvas, ctx;
let areaEl;

const STATUS_COLORS = {
  green: '#22c55e',
  yellow: '#f59e0b',
  red: '#ef4444',
};

// ─── Init ───────────────────────────────────
export function initRenderer(canvasEl, factoryAreaEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  areaEl = factoryAreaEl;
  resizeCanvas();
  initAMRs();
}

export function resizeCanvas() {
  if (!canvas || !areaEl) return;
  const w = areaEl.clientWidth;
  const h = areaEl.clientHeight;
  canvas.width = w * devicePixelRatio;
  canvas.height = h * devicePixelRatio;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

// ─── Station positions ──────────────────────
export function getStationPos(station) {
  const w = areaEl.clientWidth;
  const h = areaEl.clientHeight;
  const maxCol = Math.max(...state.stations.map(s => s.col)) + 1;
  const maxRow = Math.max(...state.stations.map(s => s.row)) + 1;
  const cellW = w / (maxCol + 1);
  const cellH = h / (maxRow + 1.5);
  return {
    x: cellW * (station.col + 1),
    y: cellH * (station.row + 1),
  };
}

// ─── Drawing ────────────────────────────────
function darken(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - amount))},${Math.round(g * (1 - amount))},${Math.round(b * (1 - amount))})`;
}

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawFloor() {
  const w = areaEl.clientWidth;
  const h = areaEl.clientHeight;
  const gridSize = 40;
  ctx.save();
  ctx.strokeStyle = getCSSVar('--bg-2') || '#1e293b';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.5;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();
}

function drawConnections(time) {
  ctx.save();
  ctx.strokeStyle = getCSSVar('--bg-3') || '#334155';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -time * 20;
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < state.stations.length - 1; i++) {
    const a = getStationPos(state.stations[i]);
    const b = getStationPos(state.stations[i + 1]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawStation(station, time) {
  const pos = getStationPos(station);
  const { x, y } = pos;
  const size = 36;
  const color = STATUS_COLORS[station.status];

  const topH = size * 0.4;
  const bodyH = size * 0.6;

  ctx.save();
  // Top face
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(x, y - topH - bodyH);
  ctx.lineTo(x + size, y - bodyH);
  ctx.lineTo(x, y - bodyH + topH);
  ctx.lineTo(x - size, y - bodyH);
  ctx.closePath();
  ctx.fill();

  // Right face
  ctx.fillStyle = darken(color, 0.3);
  ctx.beginPath();
  ctx.moveTo(x, y - bodyH + topH);
  ctx.lineTo(x + size, y - bodyH);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + topH);
  ctx.closePath();
  ctx.fill();

  // Left face
  ctx.fillStyle = darken(color, 0.15);
  ctx.beginPath();
  ctx.moveTo(x, y - bodyH + topH);
  ctx.lineTo(x - size, y - bodyH);
  ctx.lineTo(x - size, y);
  ctx.lineTo(x, y + topH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Label
  ctx.fillStyle = getCSSVar('--fg-2') || '#94a3b8';
  ctx.font = '11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(station.name, x, y + topH + 16);

  // Throughput bar
  const barW = 50;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - barW / 2, y + topH + 22, barW, 4);
  ctx.fillStyle = color;
  ctx.fillRect(x - barW / 2, y + topH + 22, barW * station.throughput, 4);
}

// ─── Unit Particles (bikes / chips / etc) ───
export function spawnUnit() {
  if (state.stations.length < 2) return;
  const path = state.stations.map(s => getStationPos(s));
  const colors = ['#00c896', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  state.bikes.push({
    path,
    pathIdx: 0,
    x: path[0].x,
    y: path[0].y,
    progress: 0,
    speed: 0.3 + Math.random() * 0.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 2,
    alive: true,
  });
}

function updateUnits(dt) {
  state.bikes.forEach(b => {
    if (!b.alive) return;
    b.progress += b.speed * dt * state.productionMultiplier;
    if (b.progress >= 1 && b.pathIdx < b.path.length - 2) {
      b.pathIdx++;
      b.progress = 0;
    }
    if (b.pathIdx < b.path.length - 1) {
      const from = b.path[b.pathIdx];
      const to = b.path[b.pathIdx + 1];
      b.x = from.x + (to.x - from.x) * b.progress;
      b.y = from.y + (to.y - from.y) * b.progress;
    }
    if (b.pathIdx >= b.path.length - 2 && b.progress >= 1) {
      b.alive = false;
    }
  });
  state.bikes = state.bikes.filter(b => b.alive);
}

function drawUnits() {
  state.bikes.forEach(b => {
    ctx.fillStyle = b.color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ─── AMRs ───────────────────────────────────
function initAMRs() {
  state.amrs = [];
  if (!areaEl) return;
  for (let i = 0; i < 5; i++) {
    const amr = {
      x: 100 + Math.random() * (areaEl.clientWidth - 200),
      y: 100 + Math.random() * (areaEl.clientHeight - 200),
      tx: 0, ty: 0,
      speed: 40 + Math.random() * 30,
      timer: 0,
      size: 6,
    };
    pickAMRTarget(amr);
    state.amrs.push(amr);
  }
}

function pickAMRTarget(amr) {
  if (!areaEl) return;
  amr.tx = 80 + Math.random() * (areaEl.clientWidth - 160);
  amr.ty = 80 + Math.random() * (areaEl.clientHeight - 160);
  amr.timer = 2 + Math.random() * 3;
}

function updateAMRs(dt) {
  state.amrs.forEach(amr => {
    const dx = amr.tx - amr.x;
    const dy = amr.ty - amr.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) {
      amr.timer -= dt;
      if (amr.timer <= 0) pickAMRTarget(amr);
    } else {
      const s = amr.speed * dt * state.productionMultiplier;
      amr.x += (dx / dist) * Math.min(s, dist);
      amr.y += (dy / dist) * Math.min(s, dist);
    }
  });
}

function drawAMRs() {
  state.amrs.forEach(amr => {
    ctx.save();
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.7;
    const angle = Math.atan2(amr.ty - amr.y, amr.tx - amr.x);
    ctx.translate(amr.x, amr.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(amr.size, 0);
    ctx.lineTo(-amr.size, -amr.size * 0.6);
    ctx.lineTo(-amr.size, amr.size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

// ─── Alert Particles ────────────────────────
export function spawnAlert(stationId) {
  const st = state.stations.find(s => s.id === stationId);
  if (!st) return;
  const pos = getStationPos(st);
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 60;
    state.particles.push({
      x: pos.x, y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.5 + Math.random() * 0.5,
      color: st.status === 'red' ? '#ef4444' : '#f59e0b',
      size: 2 + Math.random() * 3,
    });
  }
}

function updateParticles(dt) {
  state.particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= p.decay * dt;
    p.vx *= 0.97;
    p.vy *= 0.97;
  });
  state.particles = state.particles.filter(p => p.life > 0);
}

function drawParticles() {
  state.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

// ─── Main Render Loop ───────────────────────
export function renderFrame(timestamp) {
  if (!state.running) return;
  state.animFrame = requestAnimationFrame(renderFrame);

  const w = areaEl.clientWidth;
  const h = areaEl.clientHeight;

  if (!state.lastTick) state.lastTick = timestamp;
  const dt = Math.min((timestamp - state.lastTick) / 1000, 0.1);
  state.lastTick = timestamp;

  // Resize check
  if (canvas.width !== w * devicePixelRatio || canvas.height !== h * devicePixelRatio) {
    resizeCanvas();
  }

  // Clear
  ctx.save();
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.fillStyle = getCSSVar('--bg-0') || '#0a0e17';
  ctx.fillRect(0, 0, w, h);

  const time = timestamp / 1000;

  drawFloor();
  drawConnections(time);
  state.stations.forEach(s => drawStation(s, time));
  updateUnits(dt);
  drawUnits();
  updateAMRs(dt);
  drawAMRs();
  updateParticles(dt);
  drawParticles();

  ctx.restore();

  // Game logic tick
  const newUnits = gameTick(dt);
  if (newUnits > 0) {
    for (let i = 0; i < newUnits; i++) spawnUnit();
  }
}

export function reinitAMRs() {
  initAMRs();
}
