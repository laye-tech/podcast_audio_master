import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/Entities/category.entities';
import { Episode } from 'src/episode/entities/episode.entities';
import { Playlist } from 'src/playlist/entities/playlist.entities';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  DataSourceOptions,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Index('favori_User', ['uuid'], { unique: true })
@Entity('favori_users', { schema: 'public' })
export class FavoriUser {
  @ApiProperty()
  @Column('uuid', {
    primary: true,
    name: 'uuid',
    default: () => 'uuid_generate_v4()',
  })
  uuid: string;


  @ApiProperty()
  @Column('integer', { name: 'user_id' })
  user_id: number;
  
  @ApiProperty()
  @Column('character varying', { name: 'episode_uuid' })
  episode_uuid: string;

  @ManyToOne(() => Episode)
  @JoinColumn({ name: 'episode' })
  episode: Episode;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

 
}
