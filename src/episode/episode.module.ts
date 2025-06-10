import { Module } from '@nestjs/common';
import { EpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Episode } from './entities/episode.entities';
import { GedModule } from 'src/ged/ged.module';
import { UsersModule } from 'src/users/users.module';
import { PodcastModule } from 'src/podcast/podcast.module';

@Module({
  imports: [TypeOrmModule.forFeature([Episode]), GedModule, UsersModule,PodcastModule],
  controllers: [EpisodeController],
  providers: [EpisodeService],
  exports:[EpisodeService]

})
export class EpisodeModule {}
