/**
 * Parser CSV minimo pero correcto: soporta valores entrecomillados con
 * comas adentro, comillas escapadas como "", y saltos de linea LF/CRLF.
 * Devuelve [{header1: val, header2: val, ...}, ...].
 * La primera linea no vacia se trata como header.
 */
export function parseCSV(text: string): Record<string, string>[] {
  // Normalizar saltos de linea
  const src = text.replace(/\r\n?/g, '\n');
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        cur.push(field); field = '';
      } else if (c === '\n') {
        cur.push(field); field = '';
        rows.push(cur); cur = [];
      } else {
        field += c;
      }
    }
  }
  // Ultimo campo / fila
  if (field !== '' || cur.length > 0) { cur.push(field); rows.push(cur); }

  // Filtrar filas vacias
  const filas = rows.filter((r) => r.length > 0 && r.some((c) => c.trim() !== ''));
  if (filas.length === 0) return [];

  const headers = filas[0].map((h) => h.trim());
  const out: Record<string, string>[] = [];
  for (let i = 1; i < filas.length; i++) {
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = (filas[i][j] ?? '').trim();
    }
    out.push(obj);
  }
  return out;
}

/**
 * Acepta variantes de un nombre de columna (case-insensitive, sin
 * acentos). Util para tolerar headers de CSVs viejos.
 */
export function pick(row: Record<string, string>, ...keys: string[]): string {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const want = norm(k);
    const found = rowKeys.find((rk) => norm(rk) === want);
    if (found && row[found] !== undefined && row[found] !== '') return row[found];
  }
  return '';
}

/** True si el string parece un numero valido (incluye $, comas). */
export function parseNumOrNull(s: string): number | null {
  if (!s) return null;
  const cleaned = String(s).replace(/[\$,\s]/g, '');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normaliza una fecha a YYYY-MM-DD. Acepta:
 *   2024-05-29, 29/05/2024, 29-05-2024, 5/29/2024 (si el dia es > 12 lo asume DMY),
 *   "29 de mayo 2024", strings ISO con tiempo.
 * Devuelve null si no entiende.
 */
export function parseFechaIso(s: string): string | null {
  if (!s) return null;
  const trimmed = s.trim();
  // ISO completo o YYYY-MM-DD al inicio
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // DD/MM/YYYY o DD-MM-YYYY
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/.exec(trimmed);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = (Number(y) > 50 ? '19' : '20') + y;
    // Si dia > 12 asume DMY; si mes > 12 asume MDY. Por defecto DMY (es-MX).
    let dd = Number(d), mm = Number(m);
    if (mm > 12 && dd <= 12) { const t = dd; dd = mm; mm = t; }
    return `${y}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  }
  // Fallback: que Date lo intente
  const dt = new Date(trimmed);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 10);
  }
  return null;
}
