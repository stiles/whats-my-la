import { writable } from 'svelte/store';
import type { LAGeographyResponse } from '$lib/api/laGeography';

export interface LocationData {
  coordinates: {
    lat: number;
    lon: number;
  };
  address?: string;
  geographyData?: LAGeographyResponse;
  loading: boolean;
  error?: string;
}

function createLocationStore() {
  const { subscribe, set, update } = writable<LocationData>({
    coordinates: { lat: 0, lon: 0 },
    loading: false,
  });

  return {
    subscribe,
    setCoordinates: (lat: number, lon: number, address?: string) =>
      update((state) => ({
        ...state,
        coordinates: { lat, lon },
        address,
      })),
    setGeographyData: (data: LAGeographyResponse) =>
      update((state) => ({
        ...state,
        geographyData: data,
        loading: false,
      })),
    setLoading: (loading: boolean) =>
      update((state) => ({
        ...state,
        loading,
      })),
    setError: (error: string) =>
      update((state) => ({
        ...state,
        error,
        loading: false,
      })),
    reset: () =>
      set({
        coordinates: { lat: 0, lon: 0 },
        loading: false,
      }),
  };
}

export const locationStore = createLocationStore();

