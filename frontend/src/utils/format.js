export function formatBRL(value) {
  const n = Number(value || 0);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export function calcDelta(current = 0, previous = 0) {
  const c = Number(current || 0);
  const p = Number(previous || 0);
  if (p === 0) return { pct: c > 0 ? 100 : 0, up: c > 0 };
  const pct = ((c - p) / p) * 100;
  return { pct, up: pct >= 0 };
}
