import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { APP_NAME, APP_DESCRIPTION, APP_VERSION } from '@quickbite/config';
import { seedDatabase } from './database/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS — allow all origins in development
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',')
      : true,
    credentials: true,
  });

  // Root / landing handler for browser visitors
  const httpAdapter = app.getHttpAdapter().getInstance();
  httpAdapter.get('/', (req: any, res: any) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>QuickBite API</title><style>body{font-family:sans-serif;text-align:center;padding:50px;background:#F4F8FC;color:#0C2340;}</style></head>
        <body>
          <h1>🚀 QuickBite Platform API</h1>
          <p>Backend API server is running on <strong>port 3000</strong>.</p>
          <div style="margin-top:24px;">
            <a href="http://localhost:3001" style="display:inline-block;padding:12px 24px;background:#FF6B35;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;margin:8px;">🌐 Open Web Application (Port 3001)</a>
            <a href="/api/docs" style="display:inline-block;padding:12px 24px;background:#0984E3;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;margin:8px;">📖 Open Swagger API Docs</a>
          </div>
        </body>
      </html>
    `);
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Auto-seed database if empty
  try {
    const dataSource = app.get(DataSource);
    await seedDatabase(dataSource);
  } catch (err: any) {
    console.warn('⚠️ Seeding error:', err?.message || err);
  }

  const port = process.env.PORT || 3000;

  // Swagger API documentation (may fail with tsx due to missing metadata)
  try {
    const config = new DocumentBuilder()
      .setTitle(APP_NAME)
      .setDescription(`${APP_DESCRIPTION} — API Documentation`)
      .setVersion(APP_VERSION)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
  } catch (err) {
    console.warn('⚠️  Swagger setup skipped (tsx mode lacks type metadata)');
  }

  await app.listen(port);

  console.log(`\n🚀 ${APP_NAME} API running on http://localhost:${port}\n`);
}

bootstrap();
