// ─── Agent Mesh Overlay Renderer ────────────
// Draws the Solace Agent Mesh architecture diagram.
// Reads nodes/edges/topics from the active scenario.

import { state } from './engine.js';

let meshCanvas, meshCtx;

export function initMesh(canvasEl) {
  meshCanvas = canvasEl;
  meshCtx = canvasEl.getContext('2d');
}

export function drawMesh() {
  if (!meshCanvas || !meshCtx) return;
  const sc = state.scenario;
  if (!sc) return;

  const w = 900, h = 600;
  meshCanvas.width = w;
  meshCanvas.height = h;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const bg = isDark ? '#0a0e17' : '#f8fafc';
  const fg = isDark ? '#f1f5f9' : '#0f172a';
  const fg2 = isDark ? '#94a3b8' : '#64748b';
  const line = isDark ? '#334155' : '#cbd5e1';

  meshCtx.fillStyle = bg;
  meshCtx.fillRect(0, 0, w, h);

  const nodes = sc.meshNodes || [];
  const edges = sc.meshEdges || [];
  const topics = sc.meshTopics || [];

  // Draw edges
  edges.forEach(([fromId, toId]) => {
    const from = nodes.find(n => n.id === fromId);
    const to = nodes.find(n => n.id === toId);
    if (!from || !to) return;

    meshCtx.save();
    meshCtx.strokeStyle = line;
    meshCtx.lineWidth = 2;
    meshCtx.globalAlpha = 0.6;
    meshCtx.beginPath();
    meshCtx.moveTo(from.x, from.y);
    meshCtx.lineTo(to.x, to.y);
    meshCtx.stroke();

    // Pulse dot
    const t = (Date.now() % 2000) / 2000;
    const px = from.x + (to.x - from.x) * t;
    const py = from.y + (to.y - from.y) * t;
    meshCtx.fillStyle = from.color;
    meshCtx.globalAlpha = 1 - t;
    meshCtx.beginPath();
    meshCtx.arc(px, py, 4, 0, Math.PI * 2);
    meshCtx.fill();
    meshCtx.restore();
  });

  // Draw nodes
  nodes.forEach(n => {
    meshCtx.save();
    // Glow
    meshCtx.shadowColor = n.color;
    meshCtx.shadowBlur = 20;
    meshCtx.fillStyle = n.color;
    meshCtx.globalAlpha = 0.2;
    meshCtx.beginPath();
    meshCtx.arc(n.x, n.y, n.size + 8, 0, Math.PI * 2);
    meshCtx.fill();

    // Node
    meshCtx.globalAlpha = 1;
    meshCtx.shadowBlur = 10;
    meshCtx.fillStyle = n.color;
    meshCtx.beginPath();
    meshCtx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
    meshCtx.fill();

    // Label
    meshCtx.shadowBlur = 0;
    meshCtx.fillStyle = fg;
    meshCtx.font = '12px Inter, sans-serif';
    meshCtx.textAlign = 'center';
    meshCtx.fillText(n.label, n.x, n.y + n.size + 20);
    meshCtx.restore();
  });

  // Topics
  meshCtx.fillStyle = fg2;
  meshCtx.font = '10px JetBrains Mono, monospace';
  meshCtx.textAlign = 'center';
  topics.forEach((t, i) => {
    const spacing = w / (topics.length + 1);
    meshCtx.fillText(t, spacing * (i + 1), 130);
  });

  // Title
  meshCtx.fillStyle = fg;
  meshCtx.font = 'bold 16px Inter, sans-serif';
  meshCtx.textAlign = 'center';
  meshCtx.fillText('Solace Agent Mesh Architecture', 450, 560);
}
