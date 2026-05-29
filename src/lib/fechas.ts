// Formato de fechas DD/MM/YYYY (pedido por el equipo FC).
// Storage en D1 es siempre ISO YYYY-MM-DD. Estos helpers son SOLO para UI.

// Suma o resta minutos a un string HH:MM. Devuelve HH:MM.
export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const hh = Math.max(0, Math.floor(total / 60)) % 24;
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// Devuelve true si la fecha (YYYY-MM-DD) cae en fin de semana (sáb/dom UTC).
export function esFindeSemana(fecha: string): boolean {
  const d = new Date(fecha + 'T12:00:00Z').getUTCDay();
  return d === 0 || d === 6;
}

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
