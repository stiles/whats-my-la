// Shared initial framings for full-screen maps. Both frame where most of the
// county's population lives rather than the whole county (the Antelope Valley
// and national forest are mostly empty land).

export type BBox = [[number, number], [number, number]];

// Landscape screens: Malibu to Pomona, Palos Verdes to the foothills.
export const LA_BASIN: BBox = [
  [-118.85, 33.72],
  [-117.72, 34.32]
];

// Portrait screens: taller and narrower (Malibu to the San Gabriel Valley,
// Palos Verdes to Santa Clarita) so the basin fills a phone.
export const LA_BASIN_PORTRAIT: BBox = [
  [-118.62, 33.7],
  [-117.98, 34.36]
];
