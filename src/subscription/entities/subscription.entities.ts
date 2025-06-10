import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/Entities/category.entities';
import { Episode } from 'src/episode/entities/episode.entities';
import { Playlist } from 'src/playlist/entities/playlist.entities';
import { Podcast } from 'src/podcast/entities/podcast.entities';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  DataSourceOptions,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Index('subscription_User', ['uuid'], { unique: true })
@Entity('subscriptionUser', { schema: 'public' })
export class SubscriptionUser {
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
  @Column('character varying', { name: 'podcast_uuid' })
  podcast_uuid: string;

  @ManyToOne(() => Podcast)
  @JoinColumn({ name: 'podcast' })
  podcast: Podcast;


  @ApiProperty()
  @Column('character varying', {
    name: 'state',
    length: 100,
    default: () => "'ACTIVE'",
  })
  state: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

 
}
