import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/category/Entities/category.entities';
import { Users } from 'src/users/entities/users.entity';
import {
  Column,
  DataSourceOptions,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Index('playlist_podcast', ['uuid'], { unique: true })
@Entity('playlist', { schema: 'public' })
export class Playlist {
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
    name: 'cover_img_path',
    nullable: true,
    length: 256,
  })
  coverImgPath: string | null | {};

  @ApiProperty()
  @Column('integer', { name: 'user_id' })
  user_id: number;
  

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user' })
  user: Users;


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
