// A deliberately simple forecast for the dashboard: least-squares line through the
// daily values, projected forward and summed. Never negative. Shown as an estimate.
export function linearForecast(values: number[], horizonDays: number): number {
  const n = values.length;
  if (!n || horizonDays <= 0) return 0;
  const xs = values.map((_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den ? num / den : 0;
  const intercept = meanY - slope * meanX;
  let total = 0;
  for (let d = 0; d < horizonDays; d++) total += Math.max(0, intercept + slope * (n + d));
  return Math.round(total * 100) / 100;
}
