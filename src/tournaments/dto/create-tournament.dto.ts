import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TournamentStatus } from '../../database/entities/tournament.entity';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Spring Cup', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 16, minimum: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(2)
  maxPlayers!: number;

  @ApiProperty({ example: '2026-05-10T18:00:00.000Z', type: String, format: 'date-time' })
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @ApiProperty({ enum: TournamentStatus, example: TournamentStatus.PENDING })
  @IsEnum(TournamentStatus)
  status!: TournamentStatus;

  @ApiProperty({ example: 'ea4140da-ba9e-4181-a6b8-df0776b1f59c', format: 'uuid' })
  @IsUUID()
  gameId!: string;
}
