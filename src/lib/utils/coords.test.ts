import { expect, it } from 'vitest';
import { parseCoord } from './coords';

it.each([
  ['34.0522', 34.0522],
  ['-118.2437', null], // a longitude is out of latitude range
  [null, null],
  ['', null],
  ['abc', null],
  ['NaN', null],
  ['Infinity', null],
  ['91', null]
])('parseCoord(%s) for latitude', (raw, want) => {
  expect(parseCoord(raw, -90, 90)).toBe(want);
});

it('parseCoord for longitude', () => {
  expect(parseCoord('-118.2437', -180, 180)).toBe(-118.2437);
});
