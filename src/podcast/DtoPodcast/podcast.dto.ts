import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Category } from 'src/category/Entities/category.entities';
import { Users } from 'src/users/entities/users.entity';
export class PodcastDto {

  @IsOptional()
  uuid: string;
  
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  category_uuid: string;

  @IsNotEmpty()
  user_uuid: string;

  @IsOptional()
  coverImgPath: string;

  //Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a user_uuid ,
  // de pourvoir setter la valeur et proceder a son insertion dans la base
  @IsOptional()
  user: Users;

  //Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a category_uuid ,
  // de pourvoir setter la valeur et proceder a son insertion dans la base
  @IsOptional()
  category: Category;
}
