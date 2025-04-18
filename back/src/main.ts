import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GymFlow Backend')
    .setDescription('API for GymFlow Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document, {customSiteTitle: 'Gym Flow API'});

  // Configuración CORS
  app.enableCors({
    origin: process.env.DEPLOYFRONT || process.env.LOCALFRONT,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const loggerMiddleware = new LoggerMiddleware();
  app.use(loggerMiddleware.use);
  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina propiedades no definidas en el DTO.
      whitelist: true,
      // Lanza un error si hay propiedades no definidas
      forbidNonWhitelisted: true,
      // Transforma automáticamente los valores a los tipos definidos en el DTO
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001; // Usamos el puerto de Render o 3001 en local
  console.log('Render PORT:', port);

  await app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${port}`);
  });
}
bootstrap();
