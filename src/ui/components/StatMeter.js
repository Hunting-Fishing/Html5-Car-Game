export function meterPct(value, max = 100) {
  const safeMax = Math.max(1, Number(max) || 1);
  return Math.max(0, Math.min(100, (Number(value) || 0) / safeMax * 100));
}

export function segmentedMeter({ value, max = 100, label = 'Progress', className = '', dangerHigh = false } = {}) {
  const pct = meterPct(value, max);
  const fills = Array.from({ length: 5 }, (_, index) => {
    const start = index * 20;
    return Math.max(0, Math.min(100, ((pct - start) / 20) * 100));
  });
  const danger = dangerHigh ? ' dangerHigh' : '';
  return `
    <div class="segMeter ${className}${danger}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" style="--meter-pct:${pct}%">
      ${fills.map((fill, index) => `<span class="segMeterCell seg${index + 1}"><i style="--seg-fill:${fill}%"></i></span>`).join('')}
      <b class="segMeterNeedle" aria-hidden="true"></b>
    </div>
  `;
}

export function meterLine(label, value, max, tone) {
  const normalizedLabel = String(label || '').toLowerCase();
  const dangerHigh = tone === 'dangerHigh' || normalizedLabel.includes('heat') || normalizedLabel.includes('wear');
  return `<div class="statLine meterStatLine" data-meter-kind="${normalizedLabel}"><span>${label}</span>${segmentedMeter({ value, max, label, className: 'statMeter', dangerHigh })}<strong>${Math.floor(value)}</strong></div>`;
}
