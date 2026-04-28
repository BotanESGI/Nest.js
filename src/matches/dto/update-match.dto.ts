import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../../database/entities/match.entity';

export class UpdateMatchDto {
  @ApiPropertyOptional({ example: 2, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional({ enum: MatchStatus, example: MatchStatus.COMPLETED })
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

