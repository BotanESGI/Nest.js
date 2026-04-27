import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../database/entities/game.entity';
import { Player } from '../database/entities/player.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Game, Player])],
  controllers: [TournamentsController],
  providers: [TournamentsService],
})
export class TournamentsModule {}
