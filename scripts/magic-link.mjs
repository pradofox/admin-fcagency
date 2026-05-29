#!/usr/bin/env node
/**
 * Genera un magic link manual y lo inserta en auth_tokens (remoto).
 * Útil cuando Resend está roto o necesitas entrar como otro user para debugging.
 *
 * Uso: npm run magic -- email@dominio.com [horas]
 *   horas: cuántas horas dura el link (default 1)
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const [, , email, horasArg] = process.argv;

if (!email) {
  console.error('\nUso:  npm run magic -- email@dominio.com [horas]\n');
  process.exit(1);
}

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Email inválido.');
  process.exit(1);
}

const horas = horasArg ? Math.max(1, Math.min(168, Number(horasArg))) : 1;

function nano(len) {
  const a = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  return Array.from(randomBytes(len)).map((b) => a[b % a.length]).join('');
}

const token = nano(32);
const id = nano(16);
const ts = Date.now();
const expires = ts + horas * 3600 * 1000;
const emailEsc = email.replace(/'/g, "''").toLowerCase();

const sql = `INSERT INTO auth_tokens (id, email, token, expires_at, created_at) VALUES ('${id}', '${emailEsc}', '${token}', ${expires}, ${ts});`;

console.log(`\nGenerando magic link para ${email} (válido ${horas}h)...\n`);

try {
  execSync(`npx wrangler d1 execute fc-admin --remote --command "${sql}"`, { stdio: 'pipe' });
} catch (e) {
  console.error('Error insertando en D1:', e.message);
  process.exit(1);
}

const appUrl = 'https://admin.fcagency.mx';
console.log(`✅ Listo. Copia este link en el browser:\n`);
console.log(`${appUrl}/auth/verify?token=${token}\n`);
console.log(`Fallback (workers.dev):`);
console.log(`https://admin-fcagency.contacto-4c8.workers.dev/auth/verify?token=${token}\n`);
