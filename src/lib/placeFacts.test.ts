import { describe, expect, it } from 'vitest';
import type { LAGeographyResponse } from '$lib/api/laGeography';
import {
  buildFactGroups,
  cleanNeighborhoodCouncil,
  cleanRegion,
  cleanSchoolDistrict,
  fireStationLabel,
  placeHeadline,
  placeShortName
} from './placeFacts';

// Shapes mirror real lookup responses (after laGeography's transform).
const marVista: LAGeographyResponse = {
  coordinates: { lat: 34.005, lon: -118.43 },
  layers: {
    la_neighborhoods_comprehensive: { name: 'Mar Vista', type: 'Los Angeles' },
    la_regions: { name: 'Westside' },
    la_neighborhood_councils: { name: 'Mar Vista NC' },
    la_county_school_districts: { label: 'Los Angeles USD' }
  },
  law_enforcement: { agency: 'LAPD', division: 'Pacific', bureau: 'West Bureau' },
  fire: { agency: 'LAFD', station: 'Fire Station 62' },
  representation: { type: 'city_council', district: '11', representative: 'Traci Park' },
  supervisorDistrict: 'District 3',
  place: { placeCategory: 'la_city_neighborhood' }
};

const lakewood: LAGeographyResponse = {
  coordinates: { lat: 33.8536, lon: -118.134 },
  layers: {
    la_neighborhoods_comprehensive: { name: 'Lakewood', type: 'Lakewood' },
    la_regions: { name: 'Harbor' },
    la_county_school_districts: { label: 'Long Beach Unified School' }
  },
  law_enforcement: { agency: 'LA County Sheriff', station: 'Lakewood' },
  fire: { agency: 'LA County Fire', station: '45', type: 'contract' },
  representation: { type: 'county_supervisor', district: '4', representative: null },
  supervisorDistrict: 'District 4',
  place: { placeCategory: 'standalone_city' }
};

const santaMonica: LAGeographyResponse = {
  coordinates: { lat: 34.0195, lon: -118.4912 },
  layers: { la_neighborhoods_comprehensive: { name: 'Santa Monica', type: 'Santa Monica' } },
  law_enforcement: { agency: 'Santa Monica Police Department', station: 'Santa Monica', type: 'municipal' },
  fire: { agency: 'Santa Monica Fire Department', station: null, type: 'municipal' },
  place: { placeCategory: 'standalone_city' }
};

const eastLA: LAGeographyResponse = {
  coordinates: { lat: 34.0239, lon: -118.172 },
  layers: { la_neighborhoods_comprehensive: { name: 'East Los Angeles', type: 'Unincorporated' } },
  place: { placeCategory: 'unincorporated_area' }
};

function facts(data: LAGeographyResponse) {
  return Object.fromEntries(
    buildFactGroups(data).flatMap((g) => g.facts.map((f) => [f.label, [f.value, f.detail]]))
  );
}

describe('label cleanup', () => {
  it.each([
    ['South La', 'South LA'],
    ['Westside', 'Westside'],
    ['Antelope Valley', 'Antelope Valley']
  ])('region %s', (raw, want) => expect(cleanRegion(raw)).toBe(want));

  it.each([
    ['Mar Vista NC', 'Mar Vista'],
    ['Empowerment Congress Southwest Area Ndc', 'Empowerment Congress Southwest Area'],
    ['NC Valley', 'NC Valley'] // only a trailing suffix is removed
  ])('neighborhood council %s', (raw, want) => expect(cleanNeighborhoodCouncil(raw)).toBe(want));

  it('drops the outside-LA placeholder council', () => {
    expect(cleanNeighborhoodCouncil('N/A (outside LA City)')).toBeNull();
  });

  it.each([
    ['Los Angeles USD', 'Los Angeles Unified'],
    ['Santa Monica-Malibu Unif School', 'Santa Monica-Malibu Unified'],
    ['Long Beach Unified School', 'Long Beach Unified'],
    ['Lancaster Elementary', 'Lancaster Elementary']
  ])('school district %s', (raw, want) => expect(cleanSchoolDistrict(raw)).toBe(want));

  it.each([
    ['Fire Station 62', 'Station 62'],
    ['3', 'Station 3'],
    ['Station 20', 'Station 20']
  ])('fire station %s', (raw, want) => expect(fireStationLabel(raw)).toBe(want));
});

describe('buildFactGroups', () => {
  it('City of LA neighborhood', () => {
    expect(facts(marVista)).toEqual({
      Neighborhood: ['Mar Vista', undefined],
      City: ['Los Angeles', undefined],
      'Neighborhood council': ['Mar Vista', undefined],
      Region: ['Westside', undefined],
      Police: ['Pacific Division', 'LAPD · West Bureau'],
      Fire: ['Station 62', 'LAFD'],
      'City council': ['Traci Park', 'District 11'],
      'County supervisor': ['District 3', 'LA County Board of Supervisors'],
      'School district': ['Los Angeles Unified', undefined]
    });
  });

  it('fixes LAPD ordinal casing', () => {
    const data = { ...marVista, law_enforcement: { agency: 'LAPD', division: '77Th Street' } };
    expect(facts(data).Police[0]).toBe('77th Street Division');
  });

  it('contract city served by the sheriff and county fire', () => {
    const f = facts(lakewood);
    expect(f.City).toEqual(['Lakewood', undefined]);
    expect(f.Neighborhood).toBeUndefined();
    expect(f.Police).toEqual(['Lakewood Station', 'LA County Sheriff']);
    expect(f.Fire).toEqual(['Station 45', 'LA County Fire, by contract']);
    expect(f['City council']).toBeUndefined();
  });

  it('city with its own police and fire departments', () => {
    const f = facts(santaMonica);
    expect(f.Police).toEqual(['Santa Monica Police Department', undefined]);
    expect(f.Fire).toEqual(['Santa Monica Fire Department', undefined]);
  });

  it('omits empty groups', () => {
    expect(buildFactGroups(eastLA).map((g) => g.title)).toEqual(['Place']);
  });
});

describe('headlines', () => {
  it.each([
    [marVista, 'This place is in the Mar Vista neighborhood of Los Angeles', 'Mar Vista, Los Angeles'],
    [lakewood, 'This place is in the city of Lakewood in Los Angeles County', 'Lakewood'],
    [eastLA, 'This place is in unincorporated East Los Angeles in Los Angeles County', 'East Los Angeles']
  ])('%#', (data, headline, short) => {
    expect(placeHeadline(data, false)).toBe(headline);
    expect(placeShortName(data)).toBe(short);
  });

  it('outside the county', () => {
    expect(placeHeadline(null, true)).toBe('This place is outside Los Angeles County');
  });
});
