import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { Category } from 'src/category/Entities/category.entities';
import { Users } from 'src/users/entities/users.entity';
import { NumericType } from 'typeorm';
export class PlayListDto {
  @ApiProperty()
  @IsOptional()
  uuid: string;

  @ApiProperty()
  @IsNotEmpty()
  libelle: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;
  /**
   * Ne doivent pas etre envoyer ,je me sert de cela pour une fois que je recupere l'entite qui correspond a user_uuid ,
   * de pourvoir setter la valeur et proceder a son insertion dans la base
   */
  @IsOptional()
  user: Users;
  @IsOptional()
  user_id: number;
}
/**
 * ⚠️ Cette propriété ne doit pas être envoyée par le client.
 * Elle est utilisée uniquement côté serveur après récupération de l'entité,
 * afin de setter la valeur du chemin de l'image de couverture.
 * Le principe est toujours le même pour les couvertures d’image :
 * lors de l’envoi, on reçoit un fichier que l’on enregistre dans le GED,
 * et lors de la récupération, on utilise cette propriété pour fournir
 * le chemin de l’image de couverture à l’utilisateur.
 * @IsOptional()
 * coverImgPath: string;
 * PS : Je t’aime Sala ❤️
 */
