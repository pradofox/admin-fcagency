// Formato de fechas DD/MM/YYYY (pedido por el equipo FC).
// Storage en D1 es siempre ISO YYYY-MM-DD. Estos helpers son SOLO para UI.

export function formatFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function formatFechaCorta(iso: string | null | undefined): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[3]}/${m[2]}`;
}

export function formatFechaHora(iso: string | null | undefined, hora?: string | null): string {
  const f = formatFecha(iso);
  if (f === '—') return '—';
  return hora ? `${f} ${hora}` : f;
}
