/** Aktueller Zeitpunkt für Server Components (werden pro Request einmal gerendert). */
export function requestNow(): number {
  return Date.now();
}
