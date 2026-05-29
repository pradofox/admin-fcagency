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

// ── Cumpleaños ───────────────────────────────────────────────────────────────
// El campo `cumpleanos` en modelos es texto libre: puede venir como ISO
// "1992-01-19", o como texto en español "19 Enero 1992" / "14 junio 2004",
// o sin año "19 enero". Estos helpers normalizan y calculan edad / días.

const MESES_ES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
};

export interface Cumple {
  dia: number;
  mes: number;        // 1-12
  anio: number | null;
}

/** Parsea cumpleaños en texto libre o ISO. Devuelve null si no entiende. */
export function parseCumpleanos(raw: string | null | undefined): Cumple | null {
  if (!raw) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;

  // ISO YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    return { anio: Number(iso[1]), mes: Number(iso[2]), dia: Number(iso[3]) };
  }
  // DD/MM/YYYY o DD/MM
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/.exec(s);
  if (dmy) {
    return { dia: Number(dmy[1]), mes: Number(dmy[2]), anio: dmy[3] ? Number(dmy[3]) : null };
  }
  // "19 enero 1992" / "19 de enero de 1992" / "19 enero"
  const txt = /^(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]+)(?:\s+(?:de\s+)?(\d{4}))?/.exec(s);
  if (txt) {
    const mes = MESES_ES[txt[2]];
    if (mes) return { dia: Number(txt[1]), mes, anio: txt[3] ? Number(txt[3]) : null };
  }
  // "enero 19"
  const txt2 = /^([a-záéíóúñ]+)\s+(\d{1,2})/.exec(s);
  if (txt2) {
    const mes = MESES_ES[txt2[1]];
    if (mes) return { dia: Number(txt2[2]), mes, anio: null };
  }
  return null;
}

/** Edad actual a partir del cumpleaños. null si no hay año o no se entiende. */
export function calcularEdad(raw: string | null | undefined, ref: Date = new Date()): number | null {
  const c = parseCumpleanos(raw);
  if (!c || !c.anio) return null;
  let edad = ref.getFullYear() - c.anio;
  const m = ref.getMonth() + 1;
  const d = ref.getDate();
  if (m < c.mes || (m === c.mes && d < c.dia)) edad--;
  return edad >= 0 && edad < 120 ? edad : null;
}

/** Días hasta el próximo cumpleaños (0 = hoy). null si no se entiende. */
export function diasAlCumple(raw: string | null | undefined, ref: Date = new Date()): number | null {
  const c = parseCumpleanos(raw);
  if (!c) return null;
  const hoy = new Date(Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate()));
  let prox = new Date(Date.UTC(ref.getFullYear(), c.mes - 1, c.dia));
  if (prox < hoy) prox = new Date(Date.UTC(ref.getFullYear() + 1, c.mes - 1, c.dia));
  return Math.round((prox.getTime() - hoy.getTime()) / 86400000);
}

/** Texto corto del cumpleaños, ej "19 ene". */
const MES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function cumpleCorto(raw: string | null | undefined): string | null {
  const c = parseCumpleanos(raw);
  if (!c) return null;
  return `${c.dia} ${MES_CORTO[c.mes - 1]}`;
}
