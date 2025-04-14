import { IsNotEmpty,IsEmail, IsOptional } from "class-validator";
export class CategoryDto {
    @IsNotEmpty()
    libelle: string;
 
    @IsNotEmpty()
    description: string;

    @IsOptional()
    state: string;

  }