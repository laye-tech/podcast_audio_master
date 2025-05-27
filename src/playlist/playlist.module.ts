import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { UsersModule } from 'src/users/users.module';
import { GedModule } from 'src/ged/ged.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './entities/playlist.entities';

@Module({
  imports:[TypeOrmModule.forFeature([Playlist]), GedModule, UsersModule],
  providers: [PlaylistService],
  controllers: [PlaylistController]
})
export class PlaylistModule {}
