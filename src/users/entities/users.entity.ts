import { ApiProperty } from '@dataui/crud/lib/crud';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('users_pkey', ['id'], { unique: true })
@Index('users_login_like', ['login'], {})
@Index('users_login_key', ['login'], { unique: true })
@Entity('users', { schema: 'public' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @ApiProperty()
  @Column('character varying', { name: 'login', unique: true, length: 30 })
  login: string;

  @ApiProperty()
  @Column('character varying', { name: 'firstname', length: 100 })
  firstname: string;


  @ApiProperty()
  @Column('character varying', { name: 'name', length: 100 })
  name: string;

  @ApiProperty()
  @Column('character varying', { name: 'password', length: 100, select: false })
  password_hash: string;


  @ApiProperty()
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;


  @ApiProperty()
  @Column('character varying', {
    name: 'email',
    length: 100,
    default: () => "''",
  })
  email: string;

  @ApiProperty()
  @Column('uuid', {
    name: 'uuid',
    nullable: true,
    default: () => 'uuid_generate_v4()',
  })
  uuid: string | null;


  @ApiProperty()
  @Column('character varying', {
    name: 'profile_picture_path',
    nullable: true,
    length: 256,
  })
  profileImgPath: string | null | {};

  @ApiProperty()
  @Column('integer', { name: 'ACCOUNT_STATE', default: () => '3' })
  accountState: number;


}



export interface UserRequestData {
  id: number;
  login: string;
  firstname: string;
  name: string;
  created_at: string;
  email: string;
  accountState: number;
  password_hash: string;
  profileImgPath: string | null;
}

export interface UserTokenData extends Omit<Users, 'password_hash'> {
  
}