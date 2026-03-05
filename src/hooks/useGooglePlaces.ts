/**
 * Google Places Autocomplete Hook
 * 환경변수 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 사용하여 주소 검색 기능을 제공합니다.
 */
import { useEffect, useRef, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface PlaceResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  region?: string;
}

export function useGooglePlaces(onPlaceSelected?: (result: PlaceResult) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const initAutocomplete = useCallback(() => {
    if (!inputRef.current || autocompleteRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    (loader as any).load().then(() => {
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current!,
        {
          types: ['address'],
          componentRestrictions: { country: ['kr', 'cn'] },
          fields: ['formatted_address', 'geometry', 'address_components'],
        }
      );

      autocompleteRef.current = autocomplete;

      // Add listener for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place || !place.geometry || !place.geometry.location) {
          return;
        }

        const result: PlaceResult = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || '',
          city: '',
          region: '',
        };

        // Extract city and region from address components
        if (place.address_components) {
          place.address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              result.city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              result.region = component.long_name;
            }
          });
        }

        // Call callback if provided
        if (onPlaceSelected) {
          onPlaceSelected(result);
        }
      });
    });
  }, [onPlaceSelected]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initAutocomplete();
    }
  }, [initAutocomplete]);

  const getPlaceDetails = useCallback((): PlaceResult | null => {
    if (!autocompleteRef.current) return null;

    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) {
      return null;
    }

    const result: PlaceResult = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address || '',
      city: '',
      region: '',
    };

    // Extract city and region from address components
    if (place.address_components) {
      place.address_components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          result.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          result.region = component.long_name;
        }
      });
    }

    return result;
  }, []);

  return {
    inputRef,
    getPlaceDetails,
  };
}
