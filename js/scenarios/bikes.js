// ─── Bike Factory Scenario ──────────────────
// Swap this file to change the entire game theme.
// See _template.js for the full schema.

export default {
  id: 'bikes',
  name: 'Autonomous Bike Factory',
  tagline: 'Dark Shift: Bike Manufacturing',
  description: 'Vertically integrated bike plant — tube laser to loading dock.',
  unitName: 'bike',
  unitNamePlural: 'bikes',
  marginPerUnit: 120,
  productionRate: 0.15,
  gameDuration: 300,
  chaosIntervalMin: 25000,
  chaosIntervalMax: 45000,

  stations: [
    { id: 'laser',     name: 'Tube Laser',     col: 0, row: 0 },
    { id: 'weld',      name: 'Robotic Weld',   col: 1, row: 0 },
    { id: 'cnc',       name: 'CNC Machine',    col: 2, row: 0 },
    { id: 'paint',     name: 'Powder Coat',    col: 3, row: 0 },
    { id: 'wheel',     name: 'Wheel Build',    col: 0, row: 1 },
    { id: 'assembly',  name: 'Final Assembly', col: 1, row: 1 },
    { id: 'amr',       name: 'AMR Fleet',      col: 2, row: 1 },
    { id: 'warehouse', name: 'Warehouse',      col: 3, row: 1 },
    { id: 'docks',     name: 'Loading Docks',  col: 2, row: 2 },
  ],

  chaosCards: [
    { id: 1,  title: 'Battery Supplier Delay',  desc: 'Key battery supplier delayed +2 days. Assembly line at risk.', severity: 'danger', affects: ['assembly','warehouse'], agents: ['supply','planner'] },
    { id: 2,  title: 'Weld Defect Spike',        desc: 'Defect rate on weld cell jumped to 8%. Quality hold triggered.', severity: 'danger', affects: ['weld'], agents: ['quality','maintenance'] },
    { id: 3,  title: 'Energy Tariff x3',          desc: 'Grid operator spiked tariffs. Energy cost tripled this hour.', severity: 'warn', affects: ['laser','cnc','paint'], agents: ['planner','supply'] },
    { id: 4,  title: 'Rush Order: Paris Dealer', desc: '200 premium bikes needed by Friday. 2x normal pace required.', severity: 'info', affects: ['assembly','docks'], agents: ['planner','logistics'] },
    { id: 5,  title: 'AMR Collision',             desc: 'Two AMRs collided at intersection B. Fleet halted for safety.', severity: 'danger', affects: ['amr'], agents: ['maintenance','logistics'] },
    { id: 6,  title: 'Paint Booth Overheat',      desc: 'Powder coat oven temp sensor reading 15% above safe limit.', severity: 'warn', affects: ['paint'], agents: ['maintenance','quality'] },
    { id: 7,  title: 'Customs Hold',              desc: 'Carbon fiber shipment stuck at Rotterdam customs. ETA unknown.', severity: 'warn', affects: ['laser','warehouse'], agents: ['supply','planner'] },
    { id: 8,  title: 'Shift Worker No-Show',      desc: 'Night shift operator absent. Manual inspection station unmanned.', severity: 'warn', affects: ['assembly'], agents: ['planner','quality'] },
    { id: 9,  title: 'Firmware Glitch: CNC',      desc: 'CNC controller reset mid-cycle. Calibration check required.', severity: 'danger', affects: ['cnc'], agents: ['maintenance','planner'] },
    { id: 10, title: 'Demand Surge: E-Bikes',     desc: 'Flash sale triggered 3x orders for e-bikes. Line reconfiguration needed.', severity: 'info', affects: ['assembly','wheel','docks'], agents: ['planner','logistics'] },
    { id: 11, title: 'Coolant Leak: Laser',        desc: 'Laser cutter coolant pressure dropping. Shutdown in 10 min without fix.', severity: 'danger', affects: ['laser'], agents: ['maintenance','supply'] },
    { id: 12, title: 'Sustainability Audit',       desc: 'Surprise sustainability auditor arriving. Carbon reporting needed ASAP.', severity: 'info', affects: ['paint','laser','cnc'], agents: ['quality','planner'] },
  ],

  agentResponses: {
    supply: [
      { action: 'Reroute to alt supplier', impact: { cost: +2000, delay: -1, output: 0 }, tags: ['+$2k cost', '-1 day delay'] },
      { action: 'Negotiate expedited shipping', impact: { cost: +800, delay: -0.5, output: 0 }, tags: ['+$800', 'Partial fix'] },
      { action: 'Pull from safety stock', impact: { cost: 0, delay: 0, output: 0.1 }, tags: ['No cost', 'Stock -10%'] },
    ],
    planner: [
      { action: 'Resequence line (skip paint for 50 units)', impact: { output: 0.2, quality: -0.05, cost: -500 }, tags: ['+20% output', '-5% quality'] },
      { action: 'Split into two sub-batches', impact: { output: 0.1, cost: +200 }, tags: ['+10% output', 'Low risk'] },
      { action: 'Defer non-critical orders 24h', impact: { output: 0, otif: -5 }, tags: ['No rush', '-5% OTIF'] },
    ],
    quality: [
      { action: 'Hold lot for full inspection', impact: { output: -0.15, quality: 0.1 }, tags: ['-15% output', '+Quality'] },
      { action: 'Statistical sampling (faster)', impact: { output: -0.05, quality: 0.03 }, tags: ['-5% output', 'Some risk'] },
      { action: 'Accept with rework tag', impact: { output: 0, quality: -0.02, cost: +300 }, tags: ['Ship now', '+$300'] },
    ],
    maintenance: [
      { action: 'Emergency repair (30 min downtime)', impact: { output: -0.2, cost: +1500 }, tags: ['-20% output', '$1.5k'] },
      { action: 'Hot-swap backup unit', impact: { output: -0.05, cost: +3000 }, tags: ['Fast fix', '$3k'] },
      { action: 'Scheduled maintenance next shift', impact: { output: 0, risk: 0.3 }, tags: ['Deferred', 'Risk 30%'] },
    ],
    logistics: [
      { action: 'Reroute AMRs via corridor C', impact: { output: -0.05, cost: +200 }, tags: ['-5% speed', 'Safe'] },
      { action: 'Switch to manual transport', impact: { output: -0.15, cost: +600 }, tags: ['Slow', 'Reliable'] },
      { action: 'Express dock assignment', impact: { output: 0.1, cost: +400 }, tags: ['+10% speed', '$400'] },
    ],
  },

  meshNodes: [
    { id: 'backbone',     label: 'Event Backbone',     x: 450, y: 80,  color: '#3b82f6', size: 32 },
    { id: 'orchestrator', label: 'Orchestrator',        x: 450, y: 200, color: '#00c896', size: 28 },
    { id: 'supply',       label: 'Supply Agent',        x: 150, y: 340, color: '#f59e0b', size: 22 },
    { id: 'planner',      label: 'Planner Agent',       x: 300, y: 340, color: '#8b5cf6', size: 22 },
    { id: 'quality',      label: 'Quality Agent',       x: 450, y: 340, color: '#22c55e', size: 22 },
    { id: 'maintenance',  label: 'Maintenance Agent',   x: 600, y: 340, color: '#ef4444', size: 22 },
    { id: 'logistics',    label: 'Logistics Agent',     x: 750, y: 340, color: '#ec4899', size: 22 },
    { id: 'gateway',      label: 'Human Gateway',       x: 450, y: 480, color: '#f1f5f9', size: 24 },
  ],

  meshEdges: [
    ['backbone', 'orchestrator'],
    ['orchestrator', 'supply'],
    ['orchestrator', 'planner'],
    ['orchestrator', 'quality'],
    ['orchestrator', 'maintenance'],
    ['orchestrator', 'logistics'],
    ['gateway', 'orchestrator'],
  ],

  meshTopics: [
    'factory/cell/*/telemetry',
    'factory/supply/eta',
    'factory/chaos/*',
    'factory/agent/*/response',
  ],

  grades: [
    { minScore: 3000, grade: 'A+', title: 'Factory Lord' },
    { minScore: 2500, grade: 'A',  title: 'Master Operator' },
    { minScore: 2000, grade: 'B+', title: 'Shift Lead' },
    { minScore: 1500, grade: 'B',  title: 'Competent GM' },
    { minScore: 1000, grade: 'C',  title: 'Surviving' },
    { minScore: 0,    grade: 'D',  title: 'Needs Training' },
  ],

  priorityModes: {
    speed:   { label: 'Speed',   production: 1.3, cost: 1.0,  quality: 0.85, energy: 1.1,  icon: 'zap' },
    margin:  { label: 'Margin',  production: 0.9, cost: 0.75, quality: 1.0,  energy: 1.0,  icon: 'dollar' },
    quality: { label: 'Quality', production: 0.8, cost: 1.1,  quality: 1.2,  energy: 1.0,  icon: 'star' },
    green:   { label: 'Green',   production: 0.85, cost: 1.05, quality: 1.0, energy: 0.7,  icon: 'leaf' },
  },
};
