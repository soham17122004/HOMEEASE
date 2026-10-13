import { GUJARAT_CITIES, GujaratCityInfo } from '../data/gujaratLocations';

export interface ParsedAddress {
  formattedAddress: string;
  apartmentOrHouseNumber: string;
  buildingName: string;
  floorNumber?: string;
  landmark?: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  placeId?: string;
  lat: number;
  lng: number;
}

let googleMapsPromise: Promise<boolean> | null = null;
let googleMapsLoadError: string | null = null;

export function getGoogleMapsApiKey(): string {
  return (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || '';
}

/**
 * Safely loads the Google Maps JavaScript API with Places and Geocoding libraries.
 * Handles auth failures, quota limits, and missing keys without crashing the app.
 */
export function loadGoogleMaps(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // Already loaded
  if (window.google?.maps?.places && window.google?.maps?.Geocoder) {
    return Promise.resolve(true);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    googleMapsLoadError = 'VITE_GOOGLE_MAPS_API_KEY is not configured.';
    return Promise.resolve(false);
  }

  googleMapsPromise = new Promise<boolean>((resolve) => {
    // Intercept Google Maps authentication error
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      console.warn('Google Maps API authentication failed: Check API key validity, billing status, or HTTP referrer restrictions.');
      googleMapsLoadError = 'Google Maps API authentication failed (check billing/domain restrictions).';
      resolve(false);
    };

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => {
        googleMapsLoadError = 'Failed to download Google Maps SDK.';
        resolve(false);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,marker&v=weekly&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    script.onerror = () => {
      googleMapsLoadError = 'Network error loading Google Maps script.';
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function getGoogleMapsLoadError(): string | null {
  return googleMapsLoadError;
}

/**
 * Parses Google Geocoder address components into standardized fields.
 */
export function extractAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string,
  lat: number,
  lng: number,
  placeId?: string
): ParsedAddress {
  let streetNumber = '';
  let route = '';
  let sublocality2 = '';
  let sublocality1 = '';
  let locality = '';
  let district = '';
  let state = '';
  let postalCode = '';
  let country = 'India';

  for (const comp of components) {
    const types = comp.types;
    if (types.includes('premise') || types.includes('subpremise') || types.includes('street_number')) {
      streetNumber = comp.long_name;
    } else if (types.includes('route')) {
      route = comp.long_name;
    } else if (types.includes('sublocality_level_2')) {
      sublocality2 = comp.long_name;
    } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
      sublocality1 = comp.long_name;
    } else if (types.includes('locality')) {
      locality = comp.long_name;
    } else if (types.includes('administrative_area_level_2')) {
      district = comp.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      state = comp.long_name;
    } else if (types.includes('postal_code')) {
      postalCode = comp.long_name;
    } else if (types.includes('country')) {
      country = comp.long_name;
    }
  }

  // Fallback city resolution
  const finalCity = locality || district || 'Junagadh';
  const finalLocality = sublocality1 || sublocality2 || route || finalCity;

  return {
    formattedAddress,
    apartmentOrHouseNumber: streetNumber || '',
    buildingName: route || sublocality2 || '',
    locality: finalLocality,
    city: finalCity,
    district: district || finalCity,
    state: state || 'Gujarat',
    postalCode: postalCode.replace(/\D/g, '').slice(0, 6),
    country: country || 'India',
    placeId,
    lat,
    lng,
  };
}

/**
 * Reverse-geocode latitude and longitude using Google Maps Geocoding API with fallback.
 */
export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<ParsedAddress | null> {
  // If Google Maps is available
  if (window.google?.maps?.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const topResult = response.results[0];
        return extractAddressComponents(
          topResult.address_components,
          topResult.formatted_address,
          lat,
          lng,
          topResult.place_id
        );
      }
    } catch (err) {
      console.warn('Google Maps reverse geocoding API error:', err);
    }
  }

  // High-fidelity fallback for Gujarat coordinates when Google API is not configured or fails
  const closestCity = findClosestGujaratCity(lat, lng);
  const matchedLocality = closestCity.localities[0] || 'City Center';
  const matchedPincode = closestCity.popularPincodes[0] || '395007';

  return {
    formattedAddress: `${matchedLocality}, ${closestCity.name}, Gujarat ${matchedPincode}`,
    apartmentOrHouseNumber: '',
    buildingName: '',
    locality: matchedLocality,
    city: closestCity.name,
    district: closestCity.district,
    state: 'Gujarat',
    postalCode: matchedPincode,
    country: 'India',
    lat,
    lng,
  };
}

export function findClosestGujaratCity(lat: number, lng: number): GujaratCityInfo {
  let closest = GUJARAT_CITIES[0];
  let minDiff = Infinity;

  for (const city of GUJARAT_CITIES) {
    const diff = Math.hypot(city.center.lat - lat, city.center.lng - lng);
    if (diff < minDiff) {
      minDiff = diff;
      closest = city;
    }
  }

  return closest;
}
