/**
 * Компонент поиска и выбора локации с картой
 */

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { searchLocation, parseCoordinates, formatDisplayName, getMapEmbedUrl, getMapFullUrl } from '../../services/location';
import type { Coordinates, LocationSuggestion } from '../../types/calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
  const skipSearchRef = useRef(false);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

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
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Location search error:', error instanceof Error ? error.message : String(error));
        setSuggestions([]);
      }
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    skipSearchRef.current = true;
    const displayName = formatDisplayName(suggestion.display_name);
    onChange(displayName);
    onCoordinatesChange(parseCoordinates(suggestion));
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative space-y-2">
      <Label>Локация</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
        <Input
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
          className="pl-10 pr-10"
          enterKeyHint="search"
          aria-label="Локация"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => selectLocation(suggestion)}
              className={cn(
                "w-full text-left px-4 py-3 min-h-[56px]",
                "hover:bg-accent border-b border-border last:border-b-0 transition-colors",
                "active:bg-accent/80"
              )}
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {suggestion.display_name.split(',')[0]}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.display_name.split(',').slice(1, 4).join(',')}
                  </p>
                  {suggestion.type && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
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
        <div className="mt-2 p-3 bg-warning-50 border border-warning-200 rounded-lg">
          <p className="text-sm text-warning-600">
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
            <div className="bg-white dark:bg-slate-800 px-3 py-2 border-t border-gray-200 dark:border-gray-700">
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
