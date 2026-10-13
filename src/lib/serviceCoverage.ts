import { ServiceArea } from '../types';
import { GUJARAT_CITIES } from '../data/gujaratLocations';

// Gujarat geographic bounds
export const GUJARAT_BOUNDS = {
  minLat: 20.06,
  maxLat: 24.71,
  minLng: 68.16,
  maxLng: 74.48,
};

// Map service slugs or IDs to standard category ID
export function normalizeCategoryId(identifier?: string): string {
  if (!identifier) return 'cat-cleaning';
  const clean = identifier.toLowerCase();
  if (clean.includes('sofa') || clean.includes('upholstery')) return 'cat-sofa';
  if (clean.includes('clean') || clean.includes('home-deep')) return 'cat-cleaning';
  if (clean.includes('ac') || clean.includes('air-conditioner')) return 'cat-ac';
  if (clean.includes('appliance') || clean.includes('washing') || clean.includes('repair')) return 'cat-appliances';
  if (clean === 'cat-sofa' || clean === 'cat-cleaning' || clean === 'cat-ac' || clean === 'cat-appliances') return clean;
  return identifier;
}

export function getCategoryDisplayName(catId: string): string {
  switch (catId) {
    case 'cat-sofa':
      return 'Sofa & Upholstery Cleaning';
    case 'cat-cleaning':
      return 'Home Deep Cleaning';
    case 'cat-ac':
      return 'AC Servicing & Repair';
    case 'cat-appliances':
      return 'Washing Machine & Appliance Repair';
    default:
      return 'Home Service';
  }
}

// Great-circle distance between two points in kilometers
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinGujaratBounds(lat: number, lng: number): boolean {
  return (
    lat >= GUJARAT_BOUNDS.minLat &&
    lat <= GUJARAT_BOUNDS.maxLat &&
    lng >= GUJARAT_BOUNDS.minLng &&
    lng <= GUJARAT_BOUNDS.maxLng
  );
}

export function isKnownGujaratCity(cityName?: string): boolean {
  if (!cityName) return false;
  const clean = cityName.trim().toLowerCase();
  return GUJARAT_CITIES.some(
    (c) => c.name.toLowerCase() === clean || clean.includes(c.name.toLowerCase())
  );
}

export interface CoverageCheckResult {
  isServiceable: boolean;
  isGujarat: boolean;
  matchedArea?: ServiceArea;
  reason?: string;
  availableCategories?: string[];
}

export function checkServiceAvailability(
  location: {
    city?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
    state?: string;
    locality?: string;
  },
  serviceIdentifier: string,
  allServiceAreas: ServiceArea[]
): CoverageCheckResult {
  const normalizedCategory = normalizeCategoryId(serviceIdentifier);
  const cleanPincode = (location.pincode || '').replace(/\D/g, '').slice(0, 6);
  const cleanCity = (location.city || '').trim().toLowerCase();
  const cleanState = (location.state || '').trim().toLowerCase();

  // 1. Verify if location is in Gujarat
  let isGujarat = true;
  if (cleanState && cleanState !== 'gujarat' && cleanState !== 'gj') {
    isGujarat = false;
  } else if (location.lat !== undefined && location.lng !== undefined) {
    if (!isWithinGujaratBounds(location.lat, location.lng)) {
      isGujarat = false;
    }
  } else if (cleanCity && !isKnownGujaratCity(cleanCity)) {
    isGujarat = false;
  }

  if (!isGujarat) {
    return {
      isServiceable: false,
      isGujarat: false,
      reason: 'HomeEase operates exclusively within the State of Gujarat, India. The selected address is outside Gujarat state borders.',
    };
  }

  // 2. Find matching service area
  // Priority 1: Match by PIN code
  let matchedArea = allServiceAreas.find((a) => a.pincode === cleanPincode);

  // Priority 2: Match by Geographic Distance if coordinates provided
  if (!matchedArea && location.lat !== undefined && location.lng !== undefined) {
    const nearby = allServiceAreas
      .map((a) => ({
        area: a,
        dist: haversineDistanceKm(location.lat!, location.lng!, a.latitude, a.longitude),
      }))
      .filter((item) => item.dist <= (item.area.radiusKm || 8))
      .sort((a, b) => a.dist - b.dist);

    if (nearby.length > 0) {
      matchedArea = nearby[0].area;
    }
  }

  // Priority 3: Match by City and Locality name
  if (!matchedArea && cleanCity) {
    matchedArea = allServiceAreas.find((a) => {
      const cityMatches = a.city.toLowerCase() === cleanCity;
      if (!cityMatches) return false;
      if (location.locality) {
        return a.locality.toLowerCase().includes(location.locality.toLowerCase());
      }
      return false;
    });
  }

  // If no area found
  if (!matchedArea) {
    return {
      isServiceable: false,
      isGujarat: true,
      reason: `We have not yet launched operations in PIN code ${cleanPincode || location.locality || cleanCity || 'this area'}. Submit an enquiry below and we will notify you upon launch!`,
    };
  }

  // Check if area is active
  if (!matchedArea.isActive) {
    return {
      isServiceable: false,
      isGujarat: true,
      matchedArea,
      reason: `Service coverage in ${matchedArea.locality}, ${matchedArea.city} (PIN ${matchedArea.pincode}) is temporarily paused by operations.`,
    };
  }

  // Check category-level availability
  const supportsCategory = matchedArea.supportedServiceCategories.includes(normalizedCategory);
  if (!supportsCategory) {
    const catName = getCategoryDisplayName(normalizedCategory);
    return {
      isServiceable: false,
      isGujarat: true,
      matchedArea,
      availableCategories: matchedArea.supportedServiceCategories,
      reason: `${matchedArea.locality} (${matchedArea.pincode}) is currently active for selected categories, but ${catName} is not yet available in this sector.`,
    };
  }

  // Successfully serviceable
  return {
    isServiceable: true,
    isGujarat: true,
    matchedArea,
    availableCategories: matchedArea.supportedServiceCategories,
  };
}
