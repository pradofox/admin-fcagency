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

/**
 * Envío genérico de correo vía Resend.
 * En dev (sin API key): imprime a consola y regresa ok.
 */
export async function sendEmail(
  opts: { to: string; subject: string; html: string; replyTo?: string },
  resendApiKey?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!resendApiKey) {
    console.log('\n=== EMAIL (dev mode) ===');
    console.log(`Para:    ${opts.to}`);
    console.log(`Asunto:  ${opts.subject}`);
    console.log('========================\n');
    return { ok: true };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FC Agency <admin@fcagency.mx>',
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {})
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('Resend error:', res.status, errText);
      return { ok: false, error: `${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: String(e?.message ?? e).slice(0, 200) };
  }
}

export interface ConvocatoriaData {
  esRecordatorio?: boolean;
  saludoNombre?: string | null;   // nombre del destinatario
  rol?: string | null;            // su rol en la producción (Modelo, Foto, etc.)
  horaLlamado?: string | null;    // hora de llamado personal
  produccionTitulo: string;
  cliente?: string | null;
  tipo?: string | null;
  fecha?: string | null;          // ya formateada
  horario?: string | null;        // ej. "09:00 – 18:00"
  ubicacionMua?: string | null;
  ubicacionShoot?: string | null;
  notas?: string | null;
  /** URL del feed .ics personal del modelo (suscribir todas sus producciones). */
  icsFeedUrl?: string | null;
  /** URL "Agregar a Google Calendar" para este evento especifico. */
  gcalEventUrl?: string | null;
}

/** Arma el HTML de una convocatoria / recordatorio de producción. */
export function buildConvocatoriaHtml(d: ConvocatoriaData): string {
  const titulo = d.esRecordatorio ? 'Recordatorio de producción' : 'Convocatoria de producción';
  const intro = d.esRecordatorio
    ? 'Te recordamos los detalles de tu próxima producción:'
    : 'Quedas convocada/o a la siguiente producción:';
  const row = (label: string, val?: string | null) =>
    val ? `<tr><td style="padding:6px 0;color:#808080;font-size:12px;width:140px;vertical-align:top">${label}</td><td style="padding:6px 0;color:#F5F5F5;font-size:13px">${val}</td></tr>` : '';
  return `<!DOCTYPE html>
<html>
  <body style="background:#080808;color:#F5F5F5;font-family:'Inter',system-ui,-apple-system,sans-serif;padding:40px 20px;margin:0">
    <div style="max-width:520px;margin:0 auto;background:#0E0E0E;border:1px solid #262626;border-radius:6px;padding:36px 32px">
      <div style="font-size:13px;font-weight:600;color:#E5E5E5;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px">FC Agency · ${titulo}</div>
      <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#F5F5F5">Hola${d.saludoNombre ? ' ' + d.saludoNombre : ''},</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 24px;color:#B3B3B3">${intro}</p>
      <div style="font-size:16px;font-weight:600;color:#F5F5F5;margin-bottom:14px">${d.produccionTitulo}</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
        ${row('Cliente', d.cliente)}
        ${row('Tipo', d.tipo)}
        ${row('Fecha', d.fecha)}
        ${row('Horario general', d.horario)}
        ${row('Tu llamado', d.horaLlamado)}
        ${row('Tu rol', d.rol)}
        ${row('Ubicación maquillaje', d.ubicacionMua)}
        ${row('Ubicación shoot', d.ubicacionShoot)}
        ${row('Notas', d.notas)}
      </table>
      ${(d.gcalEventUrl || d.icsFeedUrl) ? `
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid #262626">
        <div style="font-size:11px;color:#808080;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px">Agregar a tu calendario</div>
        ${d.gcalEventUrl ? `<a href="${d.gcalEventUrl}" style="display:inline-block;background:#FFFFFF;color:#000;padding:9px 18px;font-size:12px;text-decoration:none;font-weight:600;border-radius:4px;margin-right:8px">+ Google Calendar</a>` : ''}
        ${d.icsFeedUrl ? `<a href="${d.icsFeedUrl}" style="display:inline-block;background:transparent;color:#E5E5E5;border:1px solid #383838;padding:8px 16px;font-size:12px;text-decoration:none;font-weight:500;border-radius:4px">Suscribir todas mis producciones (.ics)</a>` : ''}
        ${d.icsFeedUrl ? `<p style="font-size:11px;color:#808080;line-height:1.6;margin:12px 0 0">El segundo link es tu calendario personal de FC Agency: cualquier producción nueva o cambio aparece solo en tu Google/Apple Calendar.</p>` : ''}
      </div>` : ''}
      <p style="font-size:11.5px;color:#808080;line-height:1.6;margin:24px 0 0">Cualquier duda, responde a este correo. — FC Agency</p>
    </div>
  </body>
</html>`;
}

/** Email de invitacion de un admin a un nuevo usuario. */
export function buildInvitationHtml(
  link: string,
  nombre: string,
  rolLabel: string,
  invitadoPor: string
): string {
  return `<!DOCTYPE html>
<html>
  <body style="background:#080808;color:#F5F5F5;font-family:'Inter',system-ui,-apple-system,sans-serif;padding:40px 20px;margin:0">
    <div style="max-width:480px;margin:0 auto;background:#0E0E0E;border:1px solid #262626;border-radius:6px;padding:36px 32px">
      <div style="font-size:13px;font-weight:600;color:#E5E5E5;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px">FC Agency · Invitación</div>
      <p style="font-size:14px;line-height:1.6;margin:0 0 12px;color:#F5F5F5">Hola ${nombre},</p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 20px;color:#B3B3B3">
        ${invitadoPor} te invitó a la plataforma admin de FC Agency con el rol de <strong style="color:#F5F5F5">${rolLabel}</strong>.
      </p>
      <p style="font-size:14px;line-height:1.6;margin:0 0 24px;color:#B3B3B3">
        Da click en el botón para entrar. El link funciona por <strong>24 horas</strong>. Después podrás pedir uno nuevo desde la pantalla de login.
      </p>
      <a href="${link}" style="display:inline-block;background:#FFFFFF;color:#000;padding:11px 26px;font-size:13px;text-decoration:none;font-weight:600;border-radius:4px">Entrar a FC Admin</a>
      <p style="font-size:11.5px;color:#808080;line-height:1.6;margin:30px 0 0">Si no esperabas esta invitación, ignora este correo. Cualquier duda, responde aquí.</p>
    </div>
  </body>
</html>`;
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
