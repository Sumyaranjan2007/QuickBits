import { Injectable, Logger } from '@nestjs/common';
import {
  IMapsProvider,
  LatLng,
  GeocodingResult,
  ReverseGeocodingResult,
  DistanceResult,
  DirectionsResult,
} from './maps.interface';

/**
 * Mock maps provider for development.
 * Returns plausible Bangalore-area data so the app is testable without a real API key.
 */
@Injectable()
export class MockMapsProvider implements IMapsProvider {
  private readonly logger = new Logger(MockMapsProvider.name);

  async geocode(address: string): Promise<GeocodingResult> {
    this.logger.log(`[MOCK] Geocoding: ${address}`);
    return {
      lat: 12.9716 + (Math.random() - 0.5) * 0.05,
      lng: 77.5946 + (Math.random() - 0.5) * 0.05,
      formattedAddress: address || '42 MG Road, Bangalore, Karnataka 560001',
    };
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult> {
    this.logger.log(`[MOCK] Reverse geocoding: ${lat}, ${lng}`);
    return {
      address: `${Math.floor(Math.random() * 200)} MG Road, Bangalore`,
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
    };
  }

  async calculateDistance(origin: LatLng, destination: LatLng): Promise<DistanceResult> {
    // Haversine formula for realistic distance
    const R = 6371;
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLng = this.toRad(destination.lng - origin.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(origin.lat)) * Math.cos(this.toRad(destination.lat)) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c * 10) / 10;
    const durationMinutes = Math.round(distanceKm * 3); // ~20 km/h average

    this.logger.log(`[MOCK] Distance: ${distanceKm}km, ${durationMinutes}min`);
    return { distanceKm, durationMinutes };
  }

  async getDirections(origin: LatLng, destination: LatLng): Promise<DirectionsResult> {
    const distance = await this.calculateDistance(origin, destination);
    return {
      ...distance,
      polyline: 'mock_polyline_data',
    };
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
