import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerRole } from '../../database/entities/player.entity';

export class UpdatePlayerDto {
  @ApiPropertyOptional({ example: 'player1', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  @ApiPropertyOptional({ example: 'player1@example.com', maxLength: 160 })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({ example: 'VeryStrongPass1', minLength: 8, maxLength: 120 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password?: string;

  @ApiPropertyOptional({ enum: PlayerRole, example: PlayerRole.ADMIN })
  @IsOptional()
  @IsEnum(PlayerRole)
  role?: PlayerRole;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string | null;
}
