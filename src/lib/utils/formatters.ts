export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0.0%';
  const percent = (value / total) * 100;
  return `${percent.toFixed(1)}%`;
}

export function formatDensity(population: number, areaSquareMiles: number): string {
  if (areaSquareMiles === 0) return '0';
  const density = population / areaSquareMiles;
  return formatNumber(density);
}

export function formatAreaSquareMiles(area: number): string {
  return area.toFixed(2);
}

export function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

