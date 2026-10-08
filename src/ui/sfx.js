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
