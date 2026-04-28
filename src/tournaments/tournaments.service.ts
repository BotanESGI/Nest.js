import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../database/entities/game.entity';
import { Player } from '../database/entities/player.entity';
import { Match } from '../database/entities/match.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ListTournamentsQueryDto } from './dto/list-tournaments.query.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepository: Repository<Tournament>,
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
    @InjectRepository(Match)
    private readonly matchesRepository: Repository<Match>,
  ) {}

  async findAll(query: ListTournamentsQueryDto): Promise<Tournament[]> {
    const where = query.status ? { status: query.status } : {};

    return this.tournamentsRepository.find({
      where,
      relations: { game: true, players: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id },
      relations: { game: true, players: true, matches: true },
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament ${id} not found`);
    }

    return tournament;
  }

  async findMatches(tournamentId: string): Promise<Match[]> {
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

  async create(createDto: CreateTournamentDto): Promise<Tournament> {
    const game = await this.gamesRepository.findOne({
      where: { id: createDto.gameId },
    });

    if (!game) {
      throw new BadRequestException('Invalid gameId: game not found');
    }

    const tournament = this.tournamentsRepository.create({
      name: createDto.name,
      maxPlayers: createDto.maxPlayers,
      startDate: createDto.startDate,
      status: createDto.status,
      game,
      players: [],
    });

    return this.tournamentsRepository.save(tournament);
  }

  async update(id: string, updateDto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.findOne(id);

    if (updateDto.gameId) {
      const game = await this.gamesRepository.findOne({
        where: { id: updateDto.gameId },
      });

      if (!game) {
        throw new BadRequestException('Invalid gameId: game not found');
      }

      tournament.game = game;
    }

    if (updateDto.name !== undefined) {
      tournament.name = updateDto.name;
    }
    if (updateDto.maxPlayers !== undefined) {
      tournament.maxPlayers = updateDto.maxPlayers;
    }
    if (updateDto.startDate !== undefined) {
      tournament.startDate = updateDto.startDate;
    }
    if (updateDto.status !== undefined) {
      tournament.status = updateDto.status;
    }

    return this.tournamentsRepository.save(tournament);
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    await this.tournamentsRepository.remove(tournament);
  }

  async joinTournament(tournamentId: string, playerId: string): Promise<Tournament> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id: tournamentId },
      relations: { players: true, game: true },
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament ${tournamentId} not found`);
    }

    const player = await this.playersRepository.findOne({ where: { id: playerId } });

    if (!player) {
      throw new BadRequestException('Invalid playerId: player not found');
    }

    const alreadyJoined = tournament.players.some((p) => p.id === player.id);
    if (alreadyJoined) {
      throw new BadRequestException('Player is already registered');
    }

    if (tournament.players.length >= tournament.maxPlayers) {
      throw new BadRequestException('Tournament is full');
    }

    tournament.players.push(player);
    return this.tournamentsRepository.save(tournament);
  }
}
