import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../database/entities/game.entity';
import { Match } from '../database/entities/match.entity';
import { Player } from '../database/entities/player.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, Tournament, Player, Game])],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}

