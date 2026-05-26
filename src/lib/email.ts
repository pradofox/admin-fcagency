/**
 * Envío del magic link.
 * En dev: imprime el link a consola.
 * En prod: usa Resend si RESEND_API_KEY está configurado.
 */
export async function sendMagicLink(
  email: string,
  link: string,
  resendApiKey?: string
): Promise<void> {
  if (!resendApiKey) {
    console.log('\n=== MAGIC LINK (dev mode) ===');
    console.log(`Para:  ${email}`);
    console.log(`Link:  ${link}`);
    console.log('============================\n');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'FC Agency <admin@fcagency.mx>',
      to: [email],
      subject: 'Tu acceso a admin.fcagency.mx',
      html: buildEmailHtml(link)
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Resend error:', res.status, errText);
    throw new Error(`Fallo enviando magic link: ${res.status}`);
  }
}

function buildEmailHtml(link: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="background:#0E0E0E;color:#F0F0F0;font-family:system-ui,sans-serif;padding:40px 20px;margin:0">
    <div style="max-width:480px;margin:0 auto;background:#161616;border:1px solid #2A2A2A;border-radius:4px;padding:40px">
      <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.35em;color:#C9A84C;margin-bottom:32px">FC AGENCY</div>
      <p style="font-size:15px;line-height:1.6;margin:0 0 24px">Hola.</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 32px">Da click en el botón para entrar a la plataforma. El link funciona por 15 minutos.</p>
      <a href="${link}" style="display:inline-block;background:#C9A84C;color:#000;padding:14px 32px;font-size:12px;letter-spacing:.25em;text-transform:uppercase;text-decoration:none;font-weight:600">Entrar</a>
      <p style="font-size:12px;color:#666;line-height:1.6;margin:32px 0 0">Si no pediste este acceso, ignora este correo.</p>
    </div>
  </body>
</html>`;
}
