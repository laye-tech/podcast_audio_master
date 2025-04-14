import { IsNotEmpty,IsEmail, IsOptional } from "class-validator";
export class AuthDto {
    @IsNotEmpty()
    login: string;
 
    @IsNotEmpty()
    password_hash: string;   
  }