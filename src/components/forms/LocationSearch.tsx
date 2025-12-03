/**
 * Компонент поиска и выбора локации с картой
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { searchLocation, parseCoordinates, formatDisplayName, getMapEmbedUrl, getMapFullUrl } from '../../services/location';
import type { Coordinates, LocationSuggestion } from '../../types/calculator';

interface LocationSearchProps {
  value: string;
  coordinates: Coordinates | null;
  onChange: (location: string) => void;
  onCoordinatesChange: (coords: Coordinates | null) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  coordinates,
  onChange,
  onCoordinatesChange
}) => {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (value.length > 3) {
        handleSearch(value);
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [value]);

  useEffect(() => {
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const handleSearch = async (query: string) => {
    if (query.length < 3) return;

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setSearching(true);
    try {
      const results = await searchLocation(query, controllerRef.current.signal);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Location search error:', error);
        setSuggestions([]);
      }
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    const displayName = formatDisplayName(suggestion.display_name);
    onChange(displayName);
    onCoordinatesChange(parseCoordinates(suggestion));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Локация</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCoordinatesChange(null);
            setShowSuggestions(false);
          }}
          onFocus={() => {
            if (value.length > 2 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder="Начните вводить адрес в Дубае..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="Локация"
        />
        {searching && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-pulse" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => selectLocation(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {suggestion.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.display_name.split(',').slice(1, 4).join(',')}
                  </p>
                  {suggestion.type && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {suggestion.type}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {suggestions.length === 0 && value.length > 3 && !searching && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            Ничего не найдено. Попробуйте другой запрос.
          </p>
        </div>
      )}

      {coordinates && (
        <div className="mt-3">
          <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
            <iframe
              width="100%"
              height="200"
              frameBorder="0"
              scrolling="no"
              src={getMapEmbedUrl(coordinates)}
              style={{ border: 0 }}
              title="Карта локации"
            />
            <div className="bg-white px-3 py-2 border-t border-gray-200">
              <a
                href={getMapFullUrl(coordinates)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                Открыть в полном размере
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
