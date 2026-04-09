help me build this: You are Claude, an expert full-stack developer and game designer. Your task is to build a complete, standalone, fun, and memorable web     
  demo called "Dark Shift: Autonomous Bike Factory" — a gamified digital twin of a near-dark European bike manufacturing plant powered by a simulated Solace     
  Agent Mesh. The demo must run entirely in the browser as a single HTML file (no server needed), using vanilla HTML/CSS/JS, CDNs for libraries, and LiteLLM for 
   real AI agent calls if possible (or mock with structured responses). The goal is to make enterprise execs and robotics founders instantly grasp the power of  
  event-driven agent orchestration in a chaotic factory environment.                                                                                             
                                                                                                                                                                 
  Core Concept                                                                                                                                                   
  Players act as the plant GM during a night shift in a vertically integrated bike factory (tube laser → robotic weld → CNC → powder coat → assembly →           
  logistics). The Solace Agent Mesh (simulated) handles 90% autonomously, but chaos events force human decisions. Make it playable, addictive, and visually      
  punchy: every choice ripples through the factory floor, agent mesh, and score in real-time. Demo length: 3-5 minutes per session, endlessly replayable.        
                                                                                                                                                                 
  Tone: Industrial toy world — isometric factory like Factorio meets polished SaaS (blocky but premium, glowing events, smooth physics). Use the                 
  website-building skill guidelines: Nexus palette, fluid type, 4px spacing, light/dark toggle, no AI slop (no purple gradients, no identical cards, no emoji    
  icons).                                                                                                                                                        
                                                                                                                                                                 
  Required Features (Build All)                                                                                                                                  
  Isometric Factory Floor (60% screen): Animated top-down/isometric view of 8-10 stations (laser cutter, weld robots, CNC, paint booth, wheel build, final       
  assembly, AMR fleet, warehouse, docks). Bikes flow as colored blobs/particles. Machines glow green (healthy), yellow (warning), red (down). AMRs zip around.   
  Chaos visible as sparks/explosions. Use Canvas or SVG with GSAP/Motion for buttery anima                                                                       
                                                                                                                                                                 
  Core Concept                                                                                                                                                   
  Players act as the plant GM during a night shift in a vertically integrated bike factory (tube laser → robotic weld → CNC → powder coat → assembly →           
  logistics). The Solace Agent Mesh (simulated) handles 90% autonomously, but chaos events force human decisions. Make it playable, addictive, and visually      
  punchy: every choice ripples through the factory floor, agent mesh, and score in real-time. Demo length: 3-5 minutes per session, endlessly replayable.        
                                                                                                                                                                 
  Tone: Industrial toy world — isometric factory like Factorio meets polished SaaS (blocky but premium, glowing events, smooth physics). Use the                 
  website-building skill guidelines: Nexus palette, fluid type, 4px spacing, light/dark toggle, no AI slop (no purple gradients, no identical cards, no emoji    
  icons).                                                                                                                                                        
                                                                                                                                                                 
  Required Features (Build All)                                                                                                                                  
  Solace Agent Mesh diagram                                                                                                                                      
  Isometric Factory Floor (60% screen): Animated top-down/isometric view of 8-10 stations (laser cutter, weld robots, CNC, paint booth, wheel build, final       
  assembly, AMR fleet, warehouse, docks). Bikes flow as colored blobs/particles. Machines glow green (healthy), yellow (warning), red (down). AMRs zip around.   
  Chaos visible as sparks/explosions. Use Canvas or SVG with GSAP/Motion for buttery animation.                                                                  
                                                                                                                                                                 
  Chaos Cards (Top-right, 20%): Deck of 12 disruptions (e.g., "Battery supplier delay +2 days", "Weld defect spike", "Energy tariff x3", "Rush order from Paris  
  dealer", "AMR collision"). Draw one every 30-60s or on button press. Click to trigger → event publishes to mesh → agents react.                                
                                                                                                                                                                 
  Priority Dial (Bottom-right): Radial selector with 4 modes — Speed (rush output), Margin (cut costs), Quality (zero defects), Green (min carbon/energy).       
  Changes agent behavior instantly (e.g., Speed skips inspections).                                                                                              
                                                                                                                                                                 
  Agent Mesh Overlay (Toggleable, 30% overlay): Network graph showing Solace components: Event Backbone (topics like factory/supply/delay), Orchestrator (fans   
  out tasks), Domain Agents (Supply, Planner, Quality, Maintenance, Logistics), Gateways (human input). Nodes pulse with events, edges show handoffs. Use D3 or  
  SVG for live flow viz.                                                                                                                                         
                                                                                                                                                                 
  Score Dashboard (Bottom, 20%): Live KPIs — Bikes Produced, OTIF %, Margin $, Defect Rate, Energy kWh/bike, Carbon kg/bike. Animate counters (NumberFlow or     
  CSS). End-game total score with grade (A+ Factory Lord).                                                                                                       
                                                                                                                                                                 
  Human Gateway (Left sidebar): Quick controls — Override (approve/reject agent action), Chat to Copilot (LiteLLM call to Claude/GPT for advice like "What if we 
   subsource frames?"), Night Mode toggle (darker visuals, fewer humans).                                                                                        
                                                                                                                                                                 
  Replay Timeline (Post-game): Scrubbable log of every event, agent action, and KPI change. Shareable URL hash for replays.                                      
                                                                                                                                                                 
  Solace Agent Mesh Simulation (Critical for Credibility)                                                                                                        
  Simulate the full stack without a real Solace instance:                                                                                                        
                                                                                                                                                                 
  Events: Pub/sub topics (e.g., factory/cell/weld/telemetry, factory/supply/eta). Chaos cards publish → orchestrator subscribes.                                 
                                                                                                                                                                 
  Orchestrator: Decomposes chaos (e.g., delay → call Supply + Planner + Logistics agents in parallel).                                                           
                                                                                                                                                                 
  Agents: 6-8 domain specialists return structured JSON actions (mock with LiteLLM proxy or hardcoded escalating responses). Examples:                           
                                                                                                                                                                 
  Supply Agent: "Reroute to alt supplier (+€2k cost, -1 day delay)"                                                                                              
                                                                                                                                                                 
  Planner: "Resequence line (skip paint for 50 bikes)"                                                                                                           
                                                                                                                                                                 
  Quality: "Hold lot for inspection (-output +quality)"                                                                                                          
                                                                                                                                                                 
  Gateways: Player input → event → mesh → floor update.                                                                                                          
  Use LiteLLM (CDN or esm.sh) for optional real AI: proxy chaos to Claude-3.5-sonnet with system prompt "You are a factory agent mesh. Respond as JSON: {action: 
   '...', impact: {output: 0.8, cost: 1.2}}". Fallback to deterministic mocks.                                                                                   
                                                                                                                                                                 
  Game Loop (Exact Sequence)                                                                                                                                     
  Intro (10s): Factory humming, agents quiet. "Welcome to Dark Shift. Survive 5 mins of chaos."                                                                  
                                                                                                                                                                 
  Chaos Draw: Card flips → event animates on floor/mesh.                                                                                                         
                                                                                                                                                                 
  Agent Storm: Orchestrator → agents propose 2-3 options (buttons: "Approve All", "Pick One", "Override").                                                       
                                                                                                                                                                 
  Dial Shift: Player tweaks priority → agents adapt.                                                                                                             
                                                                                                                                                                 
  Ripples: Floor reacts (e.g., AMRs reroute, machines slow), scores tick.                                                                                        
                                                                                                                                                                 
  Repeat x5-7 → Game Over screen with score, replay, tweetable summary ("I scored 92% on Dark Shift Factory!").                                                  
                                                                                                                                                                 
  Tech Stack (Vanilla, Single File)                                                                                                                              
  HTML/CSS/JS only: Inline everything. Use design tokens from website-building (Nexus palette, clamp type, 4px space).                                           
                                                                                                                                                                 
  Canvas/SVG: Factory floor (Three.js lite or PixiJS CDN for isometric).                                                                                         
                                                                                                                                                                 
  Animation: GSAP (CDN) for physics, scroll reveals. Scroll-driven anim for timeline.                                                                            
                                                                                                                                                                 
  Icons: Lucide (inline SVG).                                                                                                                                    
                                                                                                                                                                 
  AI: LiteLLM via esm.sh or mock JSON.                                                                                                                           
                                                                                                                                                                 
  Charts: Chart.js for KPI sparklines.                                                                                                                           
                                                                                                                                                                 
  Responsive: Mobile-first, touch-friendly dials/buttons.                                                                                                        
                                                                                                                                                                 
  Dark/Light: Auto-toggle with sun/moon.                                                                                                                         
                                                                                                                                                                 
  PWA-ish: Add manifest for fullscreen feel.                                                                                                                     
                                                                                                                                                                 
  Visual/Motion Rules                                                                                                                                            
  Motion First: Everything physical — bikes conveyor-flow, events as glowing pulses, agents as node explosions. Golden curve everywhere.                         
                                                                                                                                                                 
  No Layout Shift: Scroll reveals opacity/clip-path only.                                                                                                        
                                                                                                                                                                 
  Easter Eggs: Minecraft block toggle (pixelate filter), "God Mode" (pause chaos).                                                                               
                                                                                                                                                                 
  Sound: Optional Web Audio beeps/pings for events (non-blocking).                                                                                               
                                                                                                                                                                 
  Deliverables (Exact Files)                                                                                                                                     
  Output as single dark-shift-factory.html + assets/ folder (gen images via tools). Include:                                                                     
                                                                                                                                                                 
  Full source code.                                                                                                                                              
                                                                                                                                                                 
  3-5 generated images: isometric factory hero, chaos cards, agent graph.                                                                                        
                                                                                                                                                                 
  Demo script: "How to run locally + embed in pitch deck."                                                                                                       
                                                                                                                                                                 
  Metrics: Load <2s, 60fps on midrange laptop.                                                                                                                   
                                                                                                                                                                 
  Success Criteria                                                                                                                                               
  Fun: Player wants "one more go" after 3 mins.                                                                                                                  
                                                                                                                                                                 
  Memorable: "I saw the agent mesh reroute the whole plant live."                                                                                                
                                                                                                                                                                 
  Educational: Execs tweet screenshots with #SolaceAgentMesh.                                                                                                    
                                                                                                                                                                 
  Credible: Matches real Solace architecture (gateways/orchestrator/agents/events).                                                                              
                                                                                                                                                                 
  Build iteratively: 1) Factory floor Canvas prototype. 2) Chaos + mesh viz. 3) Agent sim + scoring. 4) Polish motion/UI. Test on mobile/desktop. Make it        
  shareable and viral-ready. Go!   