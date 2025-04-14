import { IsNotEmpty,IsEmail, IsOptional } from "class-validator";
export class TagDto {
    @IsNotEmpty()
    libelle: string;
 
    @IsNotEmpty()
    description: string;

    @IsOptional()
    state: string;

  }