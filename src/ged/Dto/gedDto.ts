import {
  IsArray,
  IsEnum,
  isNotEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { TypeDocument } from '../Entities/ged.entities';

export type PermissionType = {
  lecture: string[];
  edition: string[];
  suppression: string[];
  telechargement: string[];
};


export class GedDto {
  @IsOptional()
  type_document: TypeDocument |string;
 
  @IsNotEmpty()
  libelle: string;

  @IsNotEmpty()
  categorie: string;

  // @IsNotEmpty()
  // permissions: PermissionType | string | string[];
  
  // @IsOptional()
  // startDate: string
  
  // @IsOptional()
  // endDate: string

  @IsOptional()
  url: string

  @IsOptional()
  doc_author: string;

  // @IsNotEmpty()
  // doc_tag: Record<string, string> | string
  @IsOptional()
  uuid: string;

  @IsOptional()
  state: string;

  @IsOptional()
  requester: string

  @IsNotEmpty()
  fk_of_all_table: string 


}
