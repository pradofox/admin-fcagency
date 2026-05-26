#!/usr/bin/env node
/**
 * Crea (o actualiza) un usuario admin en la D1 local.
 * Uso: npm run seed:admin -- tu@email.com "Tu Nombre"
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const [, , email, ...nombreParts] = process.argv;
const nombre = nombreParts.join(' ').trim();

if (!email || !nombre) {
  console.error('\nUso:  npm run seed:admin -- tu@email.com "Tu Nombre"\n');
  process.exit(1);
}

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Email inválido.');
  process.exit(1);
}

function nano(len = 16) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = randomBytes(len);
  let id = '';
  for (let i = 0; i < len; i++) id += alphabet[bytes[i] % alphabet.length];
  return id;
}

const id = nano(16);
const ts = Date.now();
const emailEsc = email.replace(/'/g, "''").toLowerCase();
const nombreEsc = nombre.replace(/'/g, "''");

const sql = `INSERT INTO users (id, email, nombre, rol, marcas, activo, created_at, updated_at)
VALUES ('${id}', '${emailEsc}', '${nombreEsc}', 'admin', '[]', 1, ${ts}, ${ts})
ON CONFLICT(email) DO UPDATE SET nombre = excluded.nombre, rol = 'admin', activo = 1, updated_at = ${ts};`;

const target = process.argv.includes('--remote') ? '--remote' : '--local';

console.log(`\nCreando admin: ${email} (${target})\n`);

try {
  execSync(`npx wrangler d1 execute fc-admin ${target} --command "${sql.replace(/"/g, '\\"')}"`, {
    stdio: 'inherit'
  });
  console.log('\nListo. Ahora ve a /login y entra con ese email.\n');
} catch (e) {
  console.error('\nError ejecutando wrangler. ¿Ya corriste las migraciones (npm run db:migrate:local)?');
  process.exit(1);
}
