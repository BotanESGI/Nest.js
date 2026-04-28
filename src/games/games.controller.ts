import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@Controller('games')
@UseInterceptors(ResponseTransformInterceptor)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gamesService.remove(id);
  }
}
