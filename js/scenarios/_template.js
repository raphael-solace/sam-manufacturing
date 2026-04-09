// ─── Scenario Template ──────────────────────
// Copy this file, rename it, and fill in your data.
// Then change the import in game.html:
//   import scenario from './js/scenarios/your-scenario.js';
//
// The engine, renderer, and UI are scenario-agnostic.
// All you need to define is the data below.

export default {
  // ─── Identity ─────────────────────────────
  id: 'my-scenario',                  // Unique slug
  name: 'My Factory Name',            // Shown in intro screen
  tagline: 'Dark Shift: My Factory',  // Used in share text
  description: 'One-line description of the manufacturing process.',

  // ─── Units ────────────────────────────────
  unitName: 'unit',                   // Singular: "1 unit produced"
  unitNamePlural: 'units',            // Plural: "50 units produced"
  marginPerUnit: 100,                 // Base margin per unit in $
  productionRate: 0.15,               // Units per second (base rate)

  // ─── Timing ───────────────────────────────
  gameDuration: 300,                  // Seconds (5 min default)
  chaosIntervalMin: 25000,            // Min ms between auto-draws
  chaosIntervalMax: 45000,            // Max ms between auto-draws

  // ─── Stations ─────────────────────────────
  // Define your production line. col/row position on a grid.
  // Units flow through stations in array order.
  stations: [
    { id: 'station-1', name: 'Station 1', col: 0, row: 0 },
    { id: 'station-2', name: 'Station 2', col: 1, row: 0 },
    // Add more...
  ],

  // ─── Chaos Cards ──────────────────────────
  // 12 disruptions. severity: 'danger' | 'warn' | 'info'
  // affects: array of station ids hit by this event
  // agents: array of agent ids that propose solutions
  chaosCards: [
    {
      id: 1,
      title: 'Event Title',
      desc: 'What happened and why it matters.',
      severity: 'danger',
      affects: ['station-1'],
      agents: ['supply', 'planner'],
    },
    // Add 11 more...
  ],

  // ─── Agent Responses ──────────────────────
  // Each agent has an array of possible responses.
  // impact keys: output, cost, quality, otif, energy, carbon
  // tags: short labels shown on the proposal card
  agentResponses: {
    supply: [
      {
        action: 'Description of what the agent proposes',
        impact: { cost: +1000, output: 0.1 },
        tags: ['+$1k', '+10% output'],
      },
    ],
    planner: [],
    quality: [],
    maintenance: [],
    logistics: [],
  },

  // ─── Mesh Topology ────────────────────────
  // Nodes and edges for the Solace Agent Mesh diagram.
  // x/y positions are on a 900x600 canvas.
  meshNodes: [
    { id: 'backbone',     label: 'Event Backbone',   x: 450, y: 80,  color: '#3b82f6', size: 32 },
    { id: 'orchestrator', label: 'Orchestrator',      x: 450, y: 200, color: '#00c896', size: 28 },
    { id: 'supply',       label: 'Supply Agent',      x: 150, y: 340, color: '#f59e0b', size: 22 },
    { id: 'planner',      label: 'Planner Agent',     x: 300, y: 340, color: '#8b5cf6', size: 22 },
    { id: 'quality',      label: 'Quality Agent',     x: 450, y: 340, color: '#22c55e', size: 22 },
    { id: 'maintenance',  label: 'Maintenance Agent', x: 600, y: 340, color: '#ef4444', size: 22 },
    { id: 'logistics',    label: 'Logistics Agent',   x: 750, y: 340, color: '#ec4899', size: 22 },
    { id: 'gateway',      label: 'Human Gateway',     x: 450, y: 480, color: '#f1f5f9', size: 24 },
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

  // ─── Grading ──────────────────────────────
  // Sorted highest first. First match wins.
  grades: [
    { minScore: 3000, grade: 'A+', title: 'Factory Lord' },
    { minScore: 2500, grade: 'A',  title: 'Master Operator' },
    { minScore: 2000, grade: 'B+', title: 'Shift Lead' },
    { minScore: 1500, grade: 'B',  title: 'Competent GM' },
    { minScore: 1000, grade: 'C',  title: 'Surviving' },
    { minScore: 0,    grade: 'D',  title: 'Needs Training' },
  ],

  // ─── Priority Modes ──────────────────────
  // Multipliers applied when player selects each mode.
  priorityModes: {
    speed:   { label: 'Speed',   production: 1.3, cost: 1.0,  quality: 0.85, energy: 1.1,  icon: 'zap' },
    margin:  { label: 'Margin',  production: 0.9, cost: 0.75, quality: 1.0,  energy: 1.0,  icon: 'dollar' },
    quality: { label: 'Quality', production: 0.8, cost: 1.1,  quality: 1.2,  energy: 1.0,  icon: 'star' },
    green:   { label: 'Green',   production: 0.85, cost: 1.05, quality: 1.0, energy: 0.7,  icon: 'leaf' },
  },
};
