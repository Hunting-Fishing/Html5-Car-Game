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

let screech;

export function setTireScreech({ active = false, intensity = 0 } = {}) {
  if (localStorage.getItem('mg-mute') === '1' || !active || intensity < 0.08) {
    stopTireScreech();
    return;
  }
  try {
    const audio = ctx || (ctx = new AudioContext());
    if (audio.state === 'suspended') audio.resume();
    if (!screech) {
      const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = audio.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const low = audio.createBiquadFilter();
      const high = audio.createBiquadFilter();
      low.type = 'bandpass';
      low.frequency.value = 420;
      low.Q.value = 0.6;
      high.type = 'bandpass';
      high.frequency.value = 1800;
      high.Q.value = 4;
      const gain = audio.createGain();
      gain.gain.value = 0.0001;
      source.connect(low);
      source.connect(high);
      low.connect(gain);
      high.connect(gain);
      gain.connect(audio.destination);
      source.start();
      screech = { source, low, high, gain };
    }
    const wobble = 1 + Math.sin(audio.currentTime * 17) * 0.04;
    screech.low.frequency.setTargetAtTime(320 + intensity * 180, audio.currentTime, 0.06);
    screech.high.frequency.setTargetAtTime((1400 + intensity * 900) * wobble, audio.currentTime, 0.04);
    screech.gain.gain.setTargetAtTime(0.02 + intensity * 0.05, audio.currentTime, 0.05);
  } catch {}
}

export function stopTireScreech() {
  if (!screech) return;
  try { screech.source.stop(); } catch {}
  screech = null;
}
export function stopEngineSound() {
  if (!engine) return;
  try { engine.fundamental.stop(); engine.overtone.stop(); } catch {}
  engine = null;
}

export function playSfx(name) {
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
