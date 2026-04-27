import { Type } from 'class-transformer';
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
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(2)
  maxPlayers!: number;

  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @IsEnum(TournamentStatus)
  status!: TournamentStatus;

  @IsUUID()
  gameId!: string;
}
