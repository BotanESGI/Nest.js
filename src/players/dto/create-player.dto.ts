import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlayerRole } from '../../database/entities/player.entity';

export class CreatePlayerDto {
  @ApiProperty({ example: 'player1', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'player1@example.com', maxLength: 160 })
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty({ example: 'VeryStrongPass1', minLength: 8, maxLength: 120 })
  @IsString()
  @MinLength(8)
  @MaxLength(120)
  password!: string;

  @ApiPropertyOptional({ enum: PlayerRole, example: PlayerRole.USER })
  @IsOptional()
  @IsEnum(PlayerRole)
  role?: PlayerRole;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string | null;
}
