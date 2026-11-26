import { describe, expect, it } from 'vitest';
import { containsPoint, formatRegion, getBounds, interiorPoint } from './neighborhoods';

// A U shape: its bbox center (2, 2) falls in the notch, outside the shape.
const uShape: GeoJSON.Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0], [4, 0], [4, 4], [3, 4], [3, 1], [1, 1], [1, 4], [0, 4], [0, 0]
    ]
  ]
};

// A square with a square hole in the middle.
const donut: GeoJSON.Polygon = {
  type: 'Polygon',
  coordinates: [
    [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
    [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]
  ]
};

describe('containsPoint', () => {
  it('handles concave shapes', () => {
    expect(containsPoint(uShape, 0.5, 3)).toBe(true);
    expect(containsPoint(uShape, 2, 2)).toBe(false);
  });

  it('respects holes', () => {
    expect(containsPoint(donut, 2, 2)).toBe(true);
    expect(containsPoint(donut, 5, 5)).toBe(false);
  });
});

describe('interiorPoint', () => {
  it.each([
    ['U shape', uShape],
    ['donut', donut]
  ])('lands inside the %s', (_, geom) => {
    const [x, y] = interiorPoint(geom);
    expect(containsPoint(geom, x, y)).toBe(true);
  });

  it('uses the largest part of a multipolygon', () => {
    const multi: GeoJSON.MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        [[[10, 10], [20, 10], [20, 20], [10, 20], [10, 10]]]
      ]
    };
    expect(interiorPoint(multi)).toEqual([15, 15]);
  });
});

it('getBounds', () => {
  expect(getBounds(uShape)).toEqual([[0, 0], [4, 4]]);
});

it.each([
  ['south-la', 'South LA'],
  ['san-fernando-valley', 'San Fernando Valley']
])('formatRegion %s', (slug, want) => expect(formatRegion(slug)).toBe(want));
