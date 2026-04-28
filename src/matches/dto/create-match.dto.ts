import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../../database/entities/match.entity';

export class CreateMatchDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  tournamentId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  player1Id!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  player2Id!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round!: number;

  @ApiPropertyOptional({ enum: MatchStatus, example: MatchStatus.PENDING })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ example: '2-1' })
  @IsOptional()
  @IsString()
  score?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  winnerId?: string | null;
}

