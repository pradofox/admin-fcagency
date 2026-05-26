import type { APIRoute } from 'astro';
import { createAuthToken } from '../../../lib/auth';
import { getDB } from '../../../lib/db';
import { sendMagicLink } from '../../../lib/email';

export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const email = (form.get('email') as string)?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return context.redirect('/login?error=invalid');
  }

  const db = getDB(context);
  const token = await createAuthToken(db, email);

  // Si no hay token (email no registrado), igual redirigimos a login-enviado
  // para no leakear qué emails están dados de alta.
  if (token) {
    const runtime = (context.locals as any).runtime;
    const appUrl = runtime?.env?.APP_URL ?? context.url.origin;
    const resendKey = runtime?.env?.RESEND_API_KEY;
    const link = `${appUrl}/auth/verify?token=${token}`;
    try {
      await sendMagicLink(email, link, resendKey);
    } catch (e) {
      console.error('Error mandando magic link:', e);
    }
  }

  return context.redirect('/login-enviado');
};
