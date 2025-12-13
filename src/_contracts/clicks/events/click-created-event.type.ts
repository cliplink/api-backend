export interface ClickCreatedEvent {
  linkId: string;
  occurredAt: string; // ISO timestamp
  ipHash?: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
  forwardedFor?: string;
}
