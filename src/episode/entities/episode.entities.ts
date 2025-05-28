import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/Entities/category.entities';
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

@Index('episode_episode', ['uuid'], { unique: true })
@Entity('episode', { schema: 'public' })
export class Episode {
  @ApiProperty()
  @Column('uuid', {
    primary: true,
    name: 'uuid',
    default: () => 'uuid_generate_v4()',
  })
  uuid: string;

  @ApiProperty()
  @Column('character varying', { name: 'libelle', length: 1000 })
  libelle: string;

  @ApiProperty()
  @Column('character varying', { name: 'description', length: 1000 })
  description: string;

  @ApiProperty()
  @Column('character varying', {
    name: 'audioFile',
    nullable: true,
    length: 256,
  })
  audioFile: string | null | {};

  @ApiProperty()
  @Column('character varying', { name: 'podcast_uuid' })
  podcast_uuid: string;

  @ManyToOne(() => Podcast)
  @JoinColumn({ name: 'podcast' })
  podcast: Podcast;

  @ApiProperty()
  @Column('character varying', { name: 'userCreated', length: 1000 })
  userCreated: Omit<Users, 'password_hash'>;

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
