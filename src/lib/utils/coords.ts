/** Parse a lat/lon query value; null when missing, non-numeric or out of range. */
export function parseCoord(raw: string | null, min: number, max: number): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
