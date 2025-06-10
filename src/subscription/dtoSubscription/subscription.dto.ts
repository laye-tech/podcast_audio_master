import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Category } from 'src/category/Entities/category.entities';
import { Episode } from 'src/episode/entities/episode.entities';
import { Playlist } from 'src/playlist/entities/playlist.entities';
import { Podcast } from 'src/podcast/entities/podcast.entities';
import { Users } from 'src/users/entities/users.entity';
import { NumericType } from 'typeorm';
export class SubscriptionDto {
  @ApiProperty()
  @IsOptional()
  uuid: string;


  @ApiProperty()
  @IsNotEmpty()
  podcast_uuid: string;


  /**
   * Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a  ,
   * de pourvoir setter la valeur et proceder a son insertion dans la base
   */

  @IsOptional()
  user_id: number;
  @IsOptional()
  podcast: Podcast;
}
/**
 * PS : Je t’aime Sala ❤️
 */
