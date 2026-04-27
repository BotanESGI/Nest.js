import { PlayerRole } from '../../database/entities/player.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: PlayerRole;
}
