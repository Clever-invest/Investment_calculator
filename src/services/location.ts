/**
 * Сервис для работы с геолокацией через OpenStreetMap
 */

import type { LocationSuggestion, Coordinates } from '../types/calculator';

// Сервис для работы с геолокацией
// Используем LocationIQ для Дубая (высокая точность) с фоллбэком на Nominatim

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;

export const searchLocation = async (
  query: string,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> => {
  if (query.length < 3) return [];

  const searchQuery = query.includes('Dubai') ? query : `${query}, Dubai, UAE`;
  
  // Выбор провайдера
  const baseUrl = LOCATIONIQ_KEY 
    ? 'https://eu1.locationiq.com/v1/search.php'
    : 'https://nominatim.openstreetmap.org/search';

  const url = new URL(baseUrl);
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '10');
  url.searchParams.set('countrycodes', 'ae');
  url.searchParams.set('accept-language', 'ru');

  if (LOCATIONIQ_KEY) {
    url.searchParams.set('key', LOCATIONIQ_KEY);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
      signal,
      referrerPolicy: 'strict-origin-when-cross-origin'
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Geocoding error:', error instanceof Error ? error.message : String(error));
  }
  
  return [];
};

export const parseCoordinates = (suggestion: LocationSuggestion): Coordinates => ({
  lat: parseFloat(suggestion.lat),
  lon: parseFloat(suggestion.lon)
});

export const formatDisplayName = (displayName: string): string => {
  return displayName.split(',').slice(0, 3).join(',');
};

export const getMapEmbedUrl = (coordinates: Coordinates): string => {
  const { lat, lon } = coordinates;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`;
};

export const getMapFullUrl = (coordinates: Coordinates): string => {
  const { lat, lon } = coordinates;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`;
};
