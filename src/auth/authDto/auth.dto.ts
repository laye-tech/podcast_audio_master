import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
export class AuthDto {
  @IsNotEmpty()
  @ApiProperty()
  login: string;

  @IsNotEmpty()
  @ApiProperty()
  password_hash: string;
}
