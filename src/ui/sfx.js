let ctx;

function tone(freq, dur, type = 'square', gain = 0.045) {
  const audio = ctx || (ctx = new AudioContext());
  if (audio.state === 'suspended') audio.resume();
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + dur);
  osc.stop(audio.currentTime + dur);
}

let engine;

export function setEngineSound({ rpm = 800, throttle = false, active = true } = {}) {
  if (localStorage.getItem('mg-mute') === '1' || !active) {
    stopEngineSound();
    return;
  }
  try {
    const audio = ctx || (ctx = new AudioContext());
    if (audio.state === 'suspended') audio.resume();
    if (!engine) {
      const fundamental = audio.createOscillator();
      const overtone = audio.createOscillator();
      const filter = audio.createBiquadFilter();
      const gain = audio.createGain();
      fundamental.type = 'sawtooth';
      overtone.type = 'square';
      filter.type = 'lowpass';
      fundamental.connect(filter);
      overtone.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      fundamental.start();
      overtone.start();
      engine = { fundamental, overtone, filter, gain };
    }
    const rate = Math.max(12, rpm / 60);
    engine.fundamental.frequency.setTargetAtTime(rate * 2, audio.currentTime, 0.05);
    engine.overtone.frequency.setTargetAtTime(rate * 4, audio.currentTime, 0.05);
    engine.filter.frequency.setTargetAtTime(280 + rpm * 0.18, audio.currentTime, 0.08);
    engine.gain.gain.setTargetAtTime(throttle ? 0.045 : 0.018, audio.currentTime, 0.08);
  } catch {}
}

export function stopEngineSound() {
  if (!engine) return;
  try { engine.fundamental.stop(); engine.overtone.stop(); } catch {}
  engine = null;
}
  if (localStorage.getItem('mg-mute') === '1') return;
  try {
    if (name === 'tap') tone(520, 0.08);
    if (name === 'merge') {
      tone(440, 0.09);
      setTimeout(() => tone(660, 0.11), 70);
    }
    if (name === 'collect') tone(330, 0.12, 'triangle');
    if (name === 'claim') tone(720, 0.16, 'triangle', 0.05);
  } catch {}
}
