export interface LocationTarget {
  name?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
}

export interface NavigationResult {
  success: boolean;
  type?: 'COORDINATES' | 'ADDRESS';
  destination?: string;
  destinationText?: string;
  /** Primary Android Intent targeting com.google.android.apps.maps with google.navigation */
  androidIntentUri?: string;
  /** Android native google.navigation URI scheme (mode=l for two-wheeler) */
  googleNavUri?: string;
  /** Universal / web search fallback URL */
  webFallbackUrl?: string;
  /** Backward-compatible url field */
  url?: string;
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
 * Validates whether latitude and longitude are valid non-zero geographical numbers.
 * Latitude must be between -90 and 90.
 * Longitude must be between -180 and 180.
 * Coordinates 0,0 are treated as uninitialized/invalid.
 */
export function isValidCoordinate(lat: any, lng: any): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Builds direct Google Maps Turn-by-Turn Navigation for delivery partner.
 *
 * REQUIREMENTS:
 * 1. google.navigation:q=LATITUDE,LONGITUDE&mode=l
 *    - mode=l: Two-wheeler/motorcycle navigation
 *    - Turn-by-turn navigation starts immediately
 *    - Uses device GPS automatically as starting point (NO "Choose starting point", NO preview)
 * 2. Explicitly targets package: com.google.android.apps.maps
 * 3. Priority:
 *    - 1st: Exact latitude + longitude (validated: -90..90, -180..180, non-zero)
 *    - 2nd: Full delivery address
 *    - 3rd: Missing error ("Location unavailable for this order.")
 */
export function buildGoogleNavigation(target: LocationTarget): NavigationResult {
  const hasCoords = isValidCoordinate(target.latitude, target.longitude);
  const address = (target.address || '').trim();

  if (hasCoords) {
    const coordsStr = `${target.latitude},${target.longitude}`;
    const googleNavUri = `google.navigation:q=${coordsStr}&mode=l`;
    const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${coordsStr}`;
    const androidIntentUri = `intent:q=${coordsStr}&mode=l#Intent;scheme=google.navigation;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;

    return {
      success: true,
      type: 'COORDINATES',
      destination: coordsStr,
      destinationText: `${target.name || 'Destination'} (${coordsStr})`,
      googleNavUri,
      androidIntentUri,
      webFallbackUrl,
      url: googleNavUri,
    };
  }

  if (address) {
    const encoded = encodeURIComponent(address);
    const googleNavUri = `google.navigation:q=${encoded}&mode=l`;
    const webFallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    const androidIntentUri = `intent:q=${encoded}&mode=l#Intent;scheme=google.navigation;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(webFallbackUrl)};end`;

    return {
      success: true,
      type: 'ADDRESS',
      destination: address,
      destinationText: address,
      googleNavUri,
      androidIntentUri,
      webFallbackUrl,
      url: googleNavUri,
    };
  }

  return {
    success: false,
    errorTitle: 'Location unavailable for this order.',
    errorMessage: 'This delivery does not have valid destination coordinates or a delivery address.',
  };
}

/**
 * Backward-compatible alias for buildGoogleNavigation
 */
export function buildGoogleMapsUrl(
  target: LocationTarget,
  _originCoords?: { latitude: number; longitude: number } | null
): NavigationResult {
  return buildGoogleNavigation(target);
}
