import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { UsersModule } from 'src/users/users.module';
import { GedModule } from 'src/ged/ged.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entities';
import { PlaylistUserModule } from 'src/playlist-user/playlist-user.module';

@Module({
  imports:[TypeOrmModule.forFeature([Playlist]), GedModule, UsersModule],
  providers: [PlaylistService],
  controllers: [PlaylistController],
  exports:[PlaylistService]

})
export class PlaylistModule {}
