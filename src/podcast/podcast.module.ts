import { Module } from '@nestjs/common';
import { PodcastController } from './podcast.controller';
import { PodcastService } from './podcast.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Podcast } from './entities/podcast.entities';
import { GedModule } from 'src/ged/ged.module';
import { UsersModule } from 'src/users/users.module';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [TypeOrmModule.forFeature([Podcast]), GedModule, UsersModule,CategoryModule],
  controllers: [PodcastController],
  providers: [PodcastService],
  exports:[PodcastService]
})
export class PodcastModule {}
