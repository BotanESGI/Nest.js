import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PlayerRole } from '../../database/entities/player.entity';

export class CreatePlayerDto {
  @IsString()
  @MaxLength(50)
  username!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password!: string;

  @IsOptional()
  @IsEnum(PlayerRole)
  role?: PlayerRole;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string | null;
}
