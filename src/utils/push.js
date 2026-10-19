// Texto honesto de lo que pasó con la notificación push (respuesta "push" del API)
export function textoPush(push, quien = 'padres de familia') {
  if (!push) return ''
  if (push.error) return `⚠️ No se pudo mandar la notificación: ${push.error}`
  if (!push.dispositivos) return `⚠️ Ningún tutor tiene la app con notificaciones activas, así que no se mandó notificación.`
  if (push.enviados === push.dispositivos) return `🔔 Notificación enviada a ${push.enviados} dispositivo(s) de ${quien}.`
  return `🔔 Notificación enviada a ${push.enviados} de ${push.dispositivos} dispositivos (${push.errores} ya no estaban activos).`
}
