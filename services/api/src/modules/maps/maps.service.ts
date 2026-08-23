import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMapsProvider, LatLng, GeocodingResult, ReverseGeocodingResult, DistanceResult, DirectionsResult } from './providers/maps.interface';
import { MockMapsProvider } from './providers/mock-maps.provider';

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly provider: IMapsProvider;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(MockMapsProvider) private readonly mockProvider: MockMapsProvider,
  ) {
    // Use mock provider unless real API key is configured
    this.provider = this.mockProvider;
    this.logger.log('Maps provider: Mock');
  }

  geocode(address: string) {
    return this.provider.geocode(address);
  }

  reverseGeocode(lat: number, lng: number) {
    return this.provider.reverseGeocode(lat, lng);
  }

  calculateDistance(origin: LatLng, destination: LatLng) {
    return this.provider.calculateDistance(origin, destination);
  }

  getDirections(origin: LatLng, destination: LatLng) {
    return this.provider.getDirections(origin, destination);
  }
}
