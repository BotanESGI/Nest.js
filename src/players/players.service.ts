import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Player, PlayerRole } from '../database/entities/player.entity';
import { Tournament } from '../database/entities/tournament.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

export type SafePlayer = Omit<Player, 'password'>;

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepository: Repository<Player>,
  ) {}

  async findAll(): Promise<SafePlayer[]> {
    const players = await this.playersRepository.find({
      order: { createdAt: 'DESC' },
    });
    return players.map((player) => this.toSafePlayer(player));
  }

  async findOne(id: string): Promise<SafePlayer> {
    const player = await this.playersRepository.findOne({ where: { id } });

    if (!player) {
      throw new NotFoundException(`Player ${id} not found`);
    }

    return this.toSafePlayer(player);
  }

  async findTournaments(id: string): Promise<Tournament[]> {
    const player = await this.playersRepository.findOne({
      where: { id },
      relations: { tournaments: { game: true } },
      order: { tournaments: { createdAt: 'DESC' } },
    });

    if (!player) {
      throw new NotFoundException(`Player ${id} not found`);
    }

    return player.tournaments ?? [];
  }

  async create(dto: CreatePlayerDto): Promise<SafePlayer> {
    await this.ensureUniqueFields(dto.email, dto.username);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const player = this.playersRepository.create({
      username: dto.username,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      role: dto.role ?? PlayerRole.USER,
      avatar: dto.avatar ?? null,
    });

    const savedPlayer = await this.playersRepository.save(player);
    return this.toSafePlayer(savedPlayer);
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<SafePlayer> {
    const player = await this.playersRepository.findOne({ where: { id } });

    if (!player) {
      throw new NotFoundException(`Player ${id} not found`);
    }

    await this.ensureUniqueFields(dto.email, dto.username, id);

    if (dto.username !== undefined) {
      player.username = dto.username;
    }
    if (dto.email !== undefined) {
      player.email = dto.email.toLowerCase();
    }
    if (dto.password !== undefined) {
      player.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role !== undefined) {
      player.role = dto.role;
    }
    if (dto.avatar !== undefined) {
      player.avatar = dto.avatar;
    }

    const updatedPlayer = await this.playersRepository.save(player);
    return this.toSafePlayer(updatedPlayer);
  }

  async remove(id: string): Promise<void> {
    const player = await this.playersRepository.findOne({ where: { id } });

    if (!player) {
      throw new NotFoundException(`Player ${id} not found`);
    }

    await this.playersRepository.remove(player);
  }

  private async ensureUniqueFields(
    email?: string,
    username?: string,
    excludePlayerId?: string,
  ): Promise<void> {
    if (email !== undefined) {
      const existingByEmail = await this.playersRepository.findOne({
        where: { email: email.toLowerCase() },
      });
      if (existingByEmail && existingByEmail.id !== excludePlayerId) {
        throw new ConflictException('Email already in use');
      }
    }

    if (username !== undefined) {
      const existingByUsername = await this.playersRepository.findOne({
        where: { username },
      });
      if (existingByUsername && existingByUsername.id !== excludePlayerId) {
        throw new ConflictException('Username already in use');
      }
    }
  }

  private toSafePlayer(player: Player): SafePlayer {
    const { password: _password, ...safePlayer } = player;
    return safePlayer;
  }
}
