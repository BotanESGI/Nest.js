import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitResultDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  winnerId!: string;

  @ApiProperty({ example: '2-1' })
  @IsString()
  @IsNotEmpty()
  score!: string;
}

