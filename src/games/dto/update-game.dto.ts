import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGameDto {
  @ApiPropertyOptional({ example: 'Counter Strike 2', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Valve', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  publisher?: string;

  @ApiPropertyOptional({ example: '2023-09-27', type: String, format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  releaseDate?: Date;

  @ApiPropertyOptional({ example: 'FPS', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  genre?: string;
}

