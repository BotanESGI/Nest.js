import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TournamentStatus } from '../../database/entities/tournament.entity';

export class UpdateTournamentDto {
  @ApiPropertyOptional({ example: 'Spring Cup Updated', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 32, minimum: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  maxPlayers?: number;

  @ApiPropertyOptional({
    example: '2026-05-11T18:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ enum: TournamentStatus, example: TournamentStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @ApiPropertyOptional({ example: 'ea4140da-ba9e-4181-a6b8-df0776b1f59c', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  gameId?: string;
}
