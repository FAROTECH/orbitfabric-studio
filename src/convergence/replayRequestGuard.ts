import { sameIntegrationMembership, type IntegrationGenerationMembership } from "./integrationSlot";

export interface ReplayRequestTicket {
  membership: IntegrationGenerationMembership;
  requestToken: string;
}

/** Local picker/preview state follows the same reject-only identity rule as the slots. */
export class ReplayRequestGuard {
  private ticket: ReplayRequestTicket | null = null;

  begin(ticket: ReplayRequestTicket): void { this.ticket = ticket; }
  invalidate(): void { this.ticket = null; }
  accepts(ticket: ReplayRequestTicket, active: IntegrationGenerationMembership | null): boolean {
    return Boolean(active && this.ticket &&
      sameIntegrationMembership(active, ticket.membership) &&
      sameIntegrationMembership(this.ticket.membership, ticket.membership) &&
      this.ticket.requestToken === ticket.requestToken);
  }
}
