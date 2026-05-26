/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

type Runtime = import('@astrojs/cloudflare').Runtime<{
  DB: D1Database;
  ASSETS: Fetcher;
  APP_URL: string;
  RESEND_API_KEY?: string;
}>;

export interface SessionUser {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'editor' | 'viewer';
  marcas: string[];
}

declare namespace App {
  interface Locals extends Runtime {
    user: SessionUser | null;
  }
}
