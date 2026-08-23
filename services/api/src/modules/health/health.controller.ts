import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { APP_NAME, APP_VERSION } from '@quickbite/config';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DataSource) private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'API health check' })
  async check() {
    let dbStatus = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'error';
    }

    return {
      success: true,
      data: {
        app: APP_NAME,
        version: APP_VERSION,
        status: 'ok',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      message: 'API is healthy',
    };
  }
}
