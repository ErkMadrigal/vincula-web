// Utilidades de fecha: todo el sistema trabaja en hora de México.
export const TZ_MX = 'America/Mexico_City'

// Devuelve 'YYYY-MM-DD' de la fecha dada (o de hoy) en hora de México.
// Reemplaza a date.toISOString().split('T')[0], que regresa la fecha en UTC.
export function fechaISO(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_MX,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
