import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'aya@example.com', maxLength: 160 })
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty({ example: 'VeryStrongPass1', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
