import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../database/entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>,
  ) {}

  findAll(): Promise<Game[]> {
    return this.gamesRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Game> {
    const game = await this.gamesRepository.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game ${id} not found`);
    }
    return game;
  }

  async create(dto: CreateGameDto): Promise<Game> {
    const existing = await this.gamesRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Game name already exists');
    }

    const game = this.gamesRepository.create(dto);
    return this.gamesRepository.save(game);
  }

  async update(id: string, dto: UpdateGameDto): Promise<Game> {
    const game = await this.findOne(id);

    if (dto.name !== undefined && dto.name !== game.name) {
      const existing = await this.gamesRepository.findOne({
        where: { name: dto.name },
      });
      if (existing && existing.id !== game.id) {
        throw new ConflictException('Game name already exists');
      }
      game.name = dto.name;
    }

    if (dto.publisher !== undefined) {
      game.publisher = dto.publisher;
    }
    if (dto.releaseDate !== undefined) {
      game.releaseDate = dto.releaseDate;
    }
    if (dto.genre !== undefined) {
      game.genre = dto.genre;
    }

    return this.gamesRepository.save(game);
  }

  async remove(id: string): Promise<void> {
    const game = await this.findOne(id);
    await this.gamesRepository.remove(game);
  }
}
