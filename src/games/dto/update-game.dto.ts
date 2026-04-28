import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGameDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  publisher?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  releaseDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  genre?: string;
}

