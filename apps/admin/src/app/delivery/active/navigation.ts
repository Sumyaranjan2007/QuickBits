export interface LocationTarget {
  name?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
}

export interface NavigationResult {
  success: boolean;
  url?: string;
  type?: 'COORDINATES' | 'ADDRESS';
  destinationText?: string;
  errorTitle?: string;
  errorMessage?: string;
}

export interface NavigationModalState {
  isOpen: boolean;
  type: 'UNAVAILABLE' | 'FALLBACK';
  title: string;
  message: string;
  fallbackUrl?: string;
}

/**
 * Builds Google Maps Directions URL according to strict priority:
 * 1. Latitude + Longitude: https://www.google.com/maps/dir/?api=1&destination=LATITUDE,LONGITUDE
 * 2. Complete Address:     https://www.google.com/maps/dir/?api=1&destination=ENCODED_ADDRESS
 * 3. Fallback:             Location unavailable error (never opens empty/broken map)
 */
export function buildGoogleMapsUrl(
  target: LocationTarget,
  originCoords?: { latitude: number; longitude: number } | null
): NavigationResult {
  const hasCoords =
    typeof target.latitude === 'number' &&
    !isNaN(target.latitude) &&
    typeof target.longitude === 'number' &&
    !isNaN(target.longitude) &&
    target.latitude !== 0 &&
    target.longitude !== 0;

  const address = (target.address || '').trim();

  if (hasCoords) {
    let url = `https://www.google.com/maps/dir/?api=1&destination=${target.latitude},${target.longitude}`;
    if (originCoords?.latitude && originCoords?.longitude) {
      url += `&origin=${originCoords.latitude},${originCoords.longitude}`;
    }
    return {
      success: true,
      url,
      type: 'COORDINATES',
      destinationText: `${target.name || 'Destination'} (${target.latitude}, ${target.longitude})`,
    };
  }

  if (address) {
    const encoded = encodeURIComponent(address);
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
    if (originCoords?.latitude && originCoords?.longitude) {
      url += `&origin=${originCoords.latitude},${originCoords.longitude}`;
    }
    return {
      success: true,
      url,
      type: 'ADDRESS',
      destinationText: address,
    };
  }

  return {
    success: false,
    errorTitle: 'Location unavailable',
    errorMessage: 'This delivery does not have a valid destination.',
  };
}
