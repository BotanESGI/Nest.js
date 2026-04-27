import { IsEnum, IsOptional } from 'class-validator';
import { TournamentStatus } from '../../database/entities/tournament.entity';

export class ListTournamentsQueryDto {
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;
}
