import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { CORS_ALLOWED_METHODS, CORS_ALLOWED_ORIGINS } from './config/app.config';
const corsOptions = {
  origin: CORS_ALLOWED_ORIGINS,
  methods: CORS_ALLOWED_METHODS,
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('PODCAST_BY_LAYE_TECH', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        // other transports...
      ],
    })
  });

 

  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('Podcast_By_laye_tech')
    .setDescription('Conception et implementation de plateforme pour lecoute de podcast audio court')
    .setVersion('1.0')
    .addTag('User')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // <- Le nom que tu vas référencer ensuite
    )
    .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  await app.listen(2000);
}
bootstrap();
