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
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseTransformInterceptor } from '../common/interceptors/response-transform.interceptor';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { ListTournamentsQueryDto } from './dto/list-tournaments.query.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@Controller('tournaments')
@UseInterceptors(ResponseTransformInterceptor)
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll(@Query() query: ListTournamentsQueryDto) {
    return this.tournamentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Get(':id/matches')
  findMatches(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tournamentsService.findMatches(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateTournamentDto) {
    return this.tournamentsService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.tournamentsService.remove(id);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  joinTournament(
    @Param('id', new ParseUUIDPipe()) tournamentId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.tournamentsService.joinTournament(tournamentId, request.user.id);
  }
}
