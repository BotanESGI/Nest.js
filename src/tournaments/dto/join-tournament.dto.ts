import { IsUUID } from 'class-validator';

export class JoinTournamentDto {
  @IsUUID()
  playerId!: string;
}
