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

@Index('podcast_podcast', ['uuid'], { unique: true })
@Entity('podcast', { schema: 'public' })
export class Podcast {
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


  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_uuid' })
  category: Category;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'user_uuid' })
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
