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
import { AdminGuard } from '../common/guards/admin.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayersService } from './players.service';

@ApiTags('players')
@ApiBearerAuth()
@Controller('players')
@UseInterceptors(ResponseTransformInterceptor)
@UseGuards(JwtAuthGuard, AdminGuard)
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les joueurs (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des joueurs.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 403, description: 'Role admin requis.' })
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recuperer un joueur par ID (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Joueur trouve.' })
  @ApiResponse({ status: 404, description: 'Joueur introuvable.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.findOne(id);
  }

  @Get(':id/tournaments')
  @ApiOperation({ summary: "Lister les tournois d'un joueur (admin)" })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Liste des tournois du joueur.' })
  @ApiResponse({ status: 404, description: 'Joueur introuvable.' })
  findTournaments(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.playersService.findTournaments(id);
  }

  @Post()
  @ApiOperation({ summary: 'Creer un joueur (admin)' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({ status: 201, description: 'Joueur cree.' })
  @ApiResponse({ status: 409, description: 'Email ou username deja utilise.' })
  create(@Body() createDto: CreatePlayerDto) {
    return this.playersService.create(createDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un joueur (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdatePlayerDto })
  @ApiResponse({ status: 200, description: 'Joueur mis a jour.' })
  @ApiResponse({ status: 404, description: 'Joueur introuvable.' })
  @ApiResponse({ status: 409, description: 'Email ou username deja utilise.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdatePlayerDto,
  ) {
    return this.playersService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Supprimer un joueur (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Joueur supprime.' })
  @ApiResponse({ status: 404, description: 'Joueur introuvable.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.playersService.remove(id);
  }
}
