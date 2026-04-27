import { Request } from 'express';
import { PlayerRole } from '../../database/entities/player.entity';

type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: PlayerRole;
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
