import { User } from '../users';

export interface Link {
  shortId: string;
  target: string;
  userId: string | null;
  expiresAt: string;
  createdAt: string;
  deletedAt: string | null;
  user?: User | null;
}
