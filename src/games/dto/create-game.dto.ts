import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGameDto {
  @ApiProperty({ example: 'Counter Strike 2', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Valve', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  publisher!: string;

  @ApiProperty({ example: '2023-09-27', type: String, format: 'date' })
  @Type(() => Date)
  @IsDate()
  releaseDate!: Date;

  @ApiProperty({ example: 'FPS', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  genre!: string;
}
