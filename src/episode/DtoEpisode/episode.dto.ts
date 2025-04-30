import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Category } from 'src/category/Entities/category.entities';
import { Podcast } from 'src/podcast/entities/podcast.entities';
import { Users } from 'src/users/entities/users.entity';
export class EpisodeDto {

  @IsOptional()
  uuid: string;
  
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  podcast_uuid: string;

  @IsOptional()
  audioFile: string | null | {};

  //Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a user_uuid ,
  // de pourvoir setter la valeur et proceder a son insertion dans la base
  @IsOptional()
  userCreated: Omit<Users, 'password_hash'>;


   //Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a user_uuid ,
  // de pourvoir setter la valeur et proceder a son insertion dans la base
  @IsOptional()
  podcast: Podcast;

}
