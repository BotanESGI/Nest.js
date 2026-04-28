import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../database/entities/game.entity';
import { Match, MatchStatus } from '../database/entities/match.entity';
import { Player } from '../database/entities/player.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepository: Repository<Tournament>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  findAll(): Promise<Match[]> {
    return this.matchesRepository.find({
      relations: { tournament: { game: true }, player1: true, player2: true, winner: true },
      order: { round: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Match> {
    const match = await this.matchesRepository.findOne({
      where: { id },
      relations: { tournament: { game: true }, player1: true, player2: true, winner: true },
    });
    if (!match) {
      throw new NotFoundException(`Match ${id} not found`);
    }
    return match;
  }

  async findByTournament(tournamentId: string): Promise<Match[]> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    return this.matchesRepository.find({
      where: { tournament: { id: tournamentId } },
      relations: { tournament: { game: true }, player1: true, player2: true, winner: true },
      order: { round: 'ASC' },
    });
  }

  async create(dto: CreateMatchDto): Promise<Match> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id: dto.tournamentId },
      relations: { game: true },
    });
    if (!tournament) {
      throw new BadRequestException('Invalid tournamentId: tournament not found');
    }

    // Ensure game relation is loaded (already via relations), but keep a defensive check.
    if (!tournament.game) {
      const reloaded = await this.tournamentsRepository.findOne({
        where: { id: dto.tournamentId },
        relations: { game: true },
      });
      if (!reloaded?.game) {
        throw new BadRequestException('Tournament game relation is missing');
      }
      tournament.game = reloaded.game;
    }

    // Verify referenced game exists (helps avoid half-broken tournament data)
    await this.gamesRepository.findOneOrFail({ where: { id: tournament.game.id } }).catch(() => {
      throw new BadRequestException('Tournament has invalid game relation');
    });

    if (dto.player1Id === dto.player2Id) {
      throw new BadRequestException('player1Id and player2Id must be different');
    }

    const player1 = await this.playersRepository.findOne({ where: { id: dto.player1Id } });
    if (!player1) {
      throw new BadRequestException('Invalid player1Id: player not found');
    }
    const player2 = await this.playersRepository.findOne({ where: { id: dto.player2Id } });
    if (!player2) {
      throw new BadRequestException('Invalid player2Id: player not found');
    }

    let winner: Player | null = null;
    if (dto.winnerId) {
      if (dto.winnerId !== player1.id && dto.winnerId !== player2.id) {
        throw new BadRequestException('winnerId must be player1Id or player2Id');
      }
      winner = dto.winnerId === player1.id ? player1 : player2;
    }

    const match = this.matchesRepository.create({
      tournament,
      player1,
      player2,
      round: dto.round,
      status: dto.status ?? MatchStatus.PENDING,
      score: dto.score ?? null,
      winner,
    });

    return this.matchesRepository.save(match);
  }

  async update(id: string, dto: UpdateMatchDto): Promise<Match> {
    const match = await this.findOne(id);

    if (dto.round !== undefined) {
      match.round = dto.round;
    }
    if (dto.status !== undefined) {
      match.status = dto.status;
    }
    if (dto.score !== undefined) {
      match.score = dto.score ?? null;
    }
    if (dto.winnerId !== undefined) {
      if (dto.winnerId === null) {
        match.winner = null;
      } else {
        if (dto.winnerId !== match.player1.id && dto.winnerId !== match.player2.id) {
          throw new BadRequestException('winnerId must be player1Id or player2Id');
        }
        match.winner = dto.winnerId === match.player1.id ? match.player1 : match.player2;
      }
    }

    return this.matchesRepository.save(match);
  }

  async submitResult(id: string, dto: SubmitResultDto): Promise<Match> {
    const match = await this.findOne(id);

    if (dto.winnerId !== match.player1.id && dto.winnerId !== match.player2.id) {
      throw new BadRequestException('winnerId must be player1Id or player2Id');
    }

    match.winner = dto.winnerId === match.player1.id ? match.player1 : match.player2;
    match.score = dto.score;
    match.status = MatchStatus.COMPLETED;

    return this.matchesRepository.save(match);
  }

  async remove(id: string): Promise<void> {
    const match = await this.findOne(id);
    await this.matchesRepository.remove(match);
  }
}

