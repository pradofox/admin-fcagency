import { customAlphabet } from 'nanoid';

// Alfabeto URL-safe sin caracteres ambiguos
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const id16 = customAlphabet(alphabet, 16);
const id32 = customAlphabet(alphabet, 32);

/** ID estándar para entidades (16 chars). */
export function newId(): string {
  return id16();
}

/** Token largo para auth (32 chars). */
export function newToken(): string {
  return id32();
}
