export interface CreateLink {
  target: string;
  expiresAt: Date;
  userId?: string | null;
}
