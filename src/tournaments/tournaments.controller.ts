import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ListTournamentsQueryDto } from './dto/list-tournaments.query.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@ApiTags('tournaments')
@Controller('tournaments')
@UseInterceptors(ResponseTransformInterceptor)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les tournois' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des tournois.' })
  findAll(@Query() query: ListTournamentsQueryDto) {
    return this.tournamentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Recuperer un tournoi par ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tournoi trouve.' })
  @ApiResponse({ status: 404, description: 'Tournoi introuvable.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Get(':id/matches')
  @ApiOperation({ summary: "Lister les matches d'un tournoi" })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Liste des matches du tournoi.' })
  @ApiResponse({ status: 404, description: 'Tournoi introuvable.' })
  findMatches(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tournamentsService.findMatches(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creer un tournoi (JWT requis)' })
  @ApiBody({ type: CreateTournamentDto })
  @ApiResponse({ status: 201, description: 'Tournoi cree.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  create(@Body() createDto: CreateTournamentDto) {
    return this.tournamentsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un tournoi (JWT requis)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateTournamentDto })
  @ApiResponse({ status: 200, description: 'Tournoi mis a jour.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 404, description: 'Tournoi introuvable.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un tournoi (JWT requis)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Tournoi supprime.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 404, description: 'Tournoi introuvable.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.tournamentsService.remove(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rejoindre un tournoi (JWT requis)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Joueur inscrit au tournoi.' })
  @ApiResponse({ status: 400, description: 'Inscription impossible.' })
  @ApiResponse({ status: 401, description: 'JWT manquant ou invalide.' })
  @ApiResponse({ status: 404, description: 'Tournoi introuvable.' })
  joinTournament(
    @Param('id', new ParseUUIDPipe()) tournamentId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tournamentsService.joinTournament(tournamentId, request.user.id);
  }

  @Post(':id/bracket')
  @UseGuards(JwtAuthGuard)
  generateBracket(@Param('id', new ParseUUIDPipe()) tournamentId: string) {
    return this.tournamentsService.generateBracket(tournamentId);
  }
}
