import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigModule, ConfigService } from '@nestjs/config';



@Module({
  imports: [
    MinioModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        endPoint: configService.get<string>('MINIO_ENDPOINT'),
        port: parseInt(configService.get<string>('MINIO_PORT') || '9000'),
        useSSL: false,
        accessKey: configService.get<string>('ACCESS_KEY_MINIO_PLATEFORME'),
        secretKey: configService.get<string>('SECRET_KEY_MINIO_PLATEFORME')
      }),
    }),
  ],
  providers: [MinioClientService],
  exports: [MinioClientService]
})
export class MinioClientModule { }
