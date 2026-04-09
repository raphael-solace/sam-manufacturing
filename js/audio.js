// ─── Web Audio Sound Effects ────────────────
// Scenario-agnostic. Provides simple synth SFX.

let audioCtx = null;
let soundEnabled = false;

export function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

export function setSoundEnabled(on) {
  soundEnabled = on;
  if (on) initAudio();
}

export function isSoundEnabled() {
  return soundEnabled;
}

function playTone(freq, duration = 0.1, type = 'sine', vol = 0.15) {
  if (!soundEnabled || !audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  o.connect(g);
  g.connect(audioCtx.destination);
  o.start();
  o.stop(audioCtx.currentTime + duration);
}

export function sfxEvent() {
  playTone(440, 0.15, 'square', 0.1);
  setTimeout(() => playTone(660, 0.1, 'square', 0.08), 100);
}

export function sfxApprove() {
  playTone(523, 0.1);
  setTimeout(() => playTone(659, 0.1), 80);
  setTimeout(() => playTone(784, 0.15), 160);
}

export function sfxAlarm() {
  playTone(200, 0.3, 'sawtooth', 0.12);
}

export function sfxTick() {
  playTone(1000, 0.02, 'sine', 0.05);
}
