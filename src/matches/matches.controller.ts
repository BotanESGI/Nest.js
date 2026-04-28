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
import { CreateMatchDto } from './dto/create-match.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@ApiTags('matches')
@Controller('matches')
@UseInterceptors(ResponseTransformInterceptor)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lister les matches (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des matches.' })
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recuperer un match par ID (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Match trouve.' })
  @ApiResponse({ status: 404, description: 'Match introuvable.' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creer un match (admin)' })
  @ApiBody({ type: CreateMatchDto })
  @ApiResponse({ status: 201, description: 'Match cree.' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un match (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: UpdateMatchDto })
  @ApiResponse({ status: 200, description: 'Match mis a jour.' })
  @ApiResponse({ status: 404, description: 'Match introuvable.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un match (admin)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Match supprime.' })
  @ApiResponse({ status: 404, description: 'Match introuvable.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.matchesService.remove(id);
  }

  @Post(':id/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soumettre le resultat dun match (JWT requis)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: SubmitResultDto })
  @ApiResponse({ status: 201, description: 'Resultat enregistre.' })
  @ApiResponse({ status: 404, description: 'Match introuvable.' })
  submitResult(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SubmitResultDto,
  ) {
    return this.matchesService.submitResult(id, dto);
  }
}

