import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { GedModule } from 'src/ged/ged.module';
import { UsersModule } from 'src/users/users.module';
import { EpisodeModule } from 'src/episode/episode.module';
import { PlaylistModule } from 'src/playlist/playlist.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionUser } from './entities/subscription.entities';
import { PodcastModule } from 'src/podcast/podcast.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionUser]),
    GedModule,
    UsersModule,
    EpisodeModule,
    PlaylistModule,
    PodcastModule
  ],

  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}
