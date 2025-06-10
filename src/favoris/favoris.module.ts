import { Module } from '@nestjs/common';
import { FavorisController } from './favoris.controller';
import { FavorisService } from './favoris.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriUser } from './entities/favoris.entities';
import { GedModule } from 'src/ged/ged.module';
import { UsersModule } from 'src/users/users.module';
import { EpisodeModule } from 'src/episode/episode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavoriUser]),
    GedModule,
    UsersModule,
    EpisodeModule,
  ],

  controllers: [FavorisController],
  providers: [FavorisService],
})
export class FavorisModule {}
