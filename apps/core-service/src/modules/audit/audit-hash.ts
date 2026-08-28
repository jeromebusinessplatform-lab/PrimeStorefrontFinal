export interface AuditEventInput {
  tenantId: string;
  actorType: "customer" | "operator" | "system";
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  requestId?: string;
  occurredAt: string;
  payloadRedacted: Record<string, unknown>;
  previousHash?: string;
}

export async function hashAuditEvent(input: AuditEventInput): Promise<string> {
  const canonical = JSON.stringify({
    tenantId: input.tenantId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    requestId: input.requestId ?? null,
    occurredAt: input.occurredAt,
    payloadRedacted: input.payloadRedacted,
    previousHash: input.previousHash ?? null,
  });
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
