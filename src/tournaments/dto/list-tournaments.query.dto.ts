import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '../../database/entities/tournament.entity';

export class ListTournamentsQueryDto {
  @ApiPropertyOptional({ enum: TournamentStatus, example: TournamentStatus.PENDING })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;
}
