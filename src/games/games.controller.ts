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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { GamesService } from './games.service';

@ApiTags('games')
@Controller('games')
@UseInterceptors(ResponseTransformInterceptor)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les jeux' })
  @ApiResponse({ status: 200, description: 'Liste des jeux.' })
  findAll() {
    return this.gamesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recuperer un jeu par ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Jeu trouve.' })
  @ApiResponse({ status: 404, description: 'Jeu introuvable.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.gamesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creer un jeu (admin)' })
  @ApiBody({ type: CreateGameDto })
  @ApiResponse({ status: 201, description: 'Jeu cree.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 403, description: 'Role admin requis.' })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un jeu (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateGameDto })
  @ApiResponse({ status: 200, description: 'Jeu mis a jour.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 403, description: 'Role admin requis.' })
  @ApiResponse({ status: 404, description: 'Jeu introuvable.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un jeu (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Jeu supprime.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 403, description: 'Role admin requis.' })
  @ApiResponse({ status: 404, description: 'Jeu introuvable.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.gamesService.remove(id);
  }
}
