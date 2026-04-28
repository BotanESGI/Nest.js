import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MatchStatus } from '../../database/entities/match.entity';

export class CreateMatchDto {
  @IsUUID()
  tournamentId!: string;

  @IsUUID()
  player1Id!: string;

  @IsUUID()
  player2Id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  round!: number;

  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @IsOptional()
  @IsString()
  score?: string | null;

  @IsOptional()
  @IsUUID()
  winnerId?: string | null;
}

