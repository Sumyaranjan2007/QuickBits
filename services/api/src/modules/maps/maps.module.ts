import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MockMapsProvider } from './providers/mock-maps.provider';

@Module({
  providers: [MapsService, MockMapsProvider],
  exports: [MapsService],
})
export class MapsModule {}
