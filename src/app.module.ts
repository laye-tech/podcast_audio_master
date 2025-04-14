import { MiddlewareConsumer, Module, NestModule, Scope } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestService } from './request.service';
import { AuthentificationMiddleware } from './middleware/authentification.middleware';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guards';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { FreezPipe } from './pipes/freeze.pipe';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { GedModule } from './ged/ged.module';
import { GedLogsModule } from './ged-logs/ged-logs.module';
import { GedLogs } from './ged-logs/entities/ged-logs.entities';
import { Ged } from './ged/Entities/ged.entities';
import { CategoryModule } from './category/category.module';
import { Category } from './category/Entities/category.entities';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB0_host,
    port: parseInt(process.env.DB0_port),
    username: process.env.DB0_username,
    password: process.env.DB0_password,
    database: process.env.DB0_database,
    entities: [Users,Ged,GedLogs,Category],
    synchronize: true,
    // logging:true
  }),
    UsersModule,
    AuthModule,
    GedModule,
    GedLogsModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RequestService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard

    },
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: LoggingInterceptor

    },
    // {
    //   provide: APP_PIPE,
    //   useClass: FreezPipe
    // }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthentificationMiddleware).forRoutes('*')
  }
}
