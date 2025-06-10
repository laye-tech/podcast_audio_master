import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Category } from 'src/category/Entities/category.entities';
import { Episode } from 'src/episode/entities/episode.entities';
import { Playlist } from 'src/playlist/entities/playlist.entities';
import { Users } from 'src/users/entities/users.entity';
import { NumericType } from 'typeorm';
export class FavoriUserDto {
  @ApiProperty()
  @IsOptional()
  uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  episode_uuid: string;

  /**
   * Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a  ,
   * de pourvoir setter la valeur et proceder a son insertion dans la base
   */

  @IsOptional()
  user_id: number;
  @IsOptional()
  episode: Episode;
}
/**
 * PS : Je t’aime Sala ❤️
 */
