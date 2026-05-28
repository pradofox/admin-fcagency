/**
 * Catálogo de pasos del CRM por tipo de contacto.
 * Extraído del HTML de fc-agency-community (operado por Victoria).
 * El usuario marca cada paso como completado conforme avanza el contacto.
 *
 * Decisión pendiente para Fely: estos textos son tentativos basados en el
 * patrón observado. Confirmar que los pasos del flujo real coinciden.
 */
export const PASOS_POR_TIPO: Record<string, string[]> = {
  cliente: [
    'Primer contacto',
    'Brief recibido',
    'Cotización enviada',
    'Cotización aprobada',
    'Anticipo recibido',
    'Producción agendada',
    'Equipo confirmado',
    'Modelos confirmadas',
    'Locación confirmada',
    'Producción realizada',
    'Material entregado',
    'Pago final cobrado',
    'Retro enviada',
    'Cerrado'
  ],
  modelo: [
    'Primer contacto',
    'Polas / casting recibido',
    'Medidas registradas',
    'Documentación legal',
    'Book en proceso',
    'Book completado',
    'Disponibilidad confirmada',
    'Asignada a producción',
    'Pago realizado',
    'Retro recibida'
  ],
  proveedor: [
    'Primer contacto',
    'Servicios cotizados',
    'Contratado',
    'Asignado a producción',
    'Servicio realizado',
    'Factura recibida',
    'Pago realizado',
    'Retro enviada'
  ],
  aspirante: [
    'Aplicación recibida',
    'Polas revisadas',
    'Entrevista realizada',
    'Decisión tomada'
  ]
};

export function pasosParaTipo(tipo: string): string[] {
  return PASOS_POR_TIPO[tipo] ?? [];
}
