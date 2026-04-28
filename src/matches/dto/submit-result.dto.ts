import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SubmitResultDto {
  @IsUUID()
  winnerId!: string;

  @IsString()
  @IsNotEmpty()
  score!: string;
}

