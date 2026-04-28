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
import { CreateMatchDto } from './dto/create-match.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseInterceptors(ResponseTransformInterceptor)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll() {
    return this.matchesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMatchDto,
  ) {
    return this.matchesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.matchesService.remove(id);
  }

  @Post(':id/result')
  @UseGuards(JwtAuthGuard)
  submitResult(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SubmitResultDto,
  ) {
    return this.matchesService.submitResult(id, dto);
  }
}

