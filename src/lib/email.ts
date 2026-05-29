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
  <body style="background:#080808;color:#F5F5F5;font-family:'Inter',system-ui,-apple-system,sans-serif;padding:40px 20px;margin:0">
    <div style="max-width:440px;margin:0 auto;background:#0E0E0E;border:1px solid #262626;border-radius:6px;padding:36px 32px">
      <div style="font-size:14px;font-weight:600;color:#F5F5F5;margin-bottom:28px;letter-spacing:-0.005em">FC Admin</div>
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#F5F5F5">Hola.</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 28px;color:#B3B3B3">Da click en el botón para entrar a la plataforma. El link funciona por 15 minutos.</p>
      <a href="${link}" style="display:inline-block;background:#FFFFFF;color:#000;padding:10px 24px;font-size:13px;text-decoration:none;font-weight:600;border-radius:4px">Entrar a la plataforma</a>
      <p style="font-size:11.5px;color:#808080;line-height:1.6;margin:28px 0 0">Si no pediste este acceso, ignora este correo.</p>
    </div>
  </body>
</html>`;
}
