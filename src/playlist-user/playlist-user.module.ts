import { Module } from '@nestjs/common';
import { PlaylistUserController } from './playlist-user.controller';
import { PlaylistUserService } from './playlist-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { GedModule } from 'src/ged/ged.module';
import { PlaylistUser } from './entities/playlistUser.entities';
import { EpisodeModule } from 'src/episode/episode.module';
import { EpisodeService } from 'src/episode/episode.service';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlaylistUser]), GedModule, UsersModule,EpisodeModule,PlaylistModule],
  controllers: [PlaylistUserController],
  providers: [PlaylistUserService],
})
export class PlaylistUserModule {}
