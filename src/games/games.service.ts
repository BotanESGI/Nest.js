import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../database/entities/game.entity';
import { CreateGameDto } from './dto/create-game.dto';

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

  create(dto: CreateGameDto): Promise<Game> {
    const game = this.gamesRepository.create(dto);
    return this.gamesRepository.save(game);
  }
}
