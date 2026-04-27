import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  publisher!: string;

  @Type(() => Date)
  @IsDate()
  releaseDate!: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  genre!: string;
}
