import { IsNotEmpty,IsEmail, IsOptional } from "class-validator";
export class UserDto {
    @IsNotEmpty()
    login: string;
    
    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    name: string;
   
    @IsEmail()
    email: string;
 
    @IsNotEmpty()
    password_hash: string;

    @IsOptional()
    profileImgPath: string;
    
  }