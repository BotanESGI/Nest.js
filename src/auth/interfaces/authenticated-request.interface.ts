import { Request } from 'express';

type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
