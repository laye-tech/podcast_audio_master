import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,IsEmail, IsOptional } from "class-validator";
export class UserDto {
    @IsNotEmpty()
    @ApiProperty()
    login: string;
    
    @IsNotEmpty()
    @ApiProperty()
    firstname: string;

    @IsNotEmpty()
    @ApiProperty()
    name: string;
   
    @IsEmail()
    @ApiProperty()
    email: string;
 
    @IsNotEmpty()
    @ApiProperty()
    password_hash: string;

    @IsOptional()
    profileImgPath: string;
    
  }