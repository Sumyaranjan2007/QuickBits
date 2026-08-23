/**
 * Maps service interface.
 * Business logic depends on this abstraction, not on Google Maps directly.
 */
export interface IMapsProvider {
  geocode(address: string): Promise<GeocodingResult>;
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult>;
  calculateDistance(origin: LatLng, destination: LatLng): Promise<DistanceResult>;
  getDirections(origin: LatLng, destination: LatLng): Promise<DirectionsResult>;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface ReverseGeocodingResult {
  address: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface DistanceResult {
  distanceKm: number;
  durationMinutes: number;
}

export interface DirectionsResult {
  distanceKm: number;
  durationMinutes: number;
  polyline: string;
}
