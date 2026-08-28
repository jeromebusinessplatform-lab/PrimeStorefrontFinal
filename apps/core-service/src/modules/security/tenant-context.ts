export interface TenantContext {
  readonly tenantId: string;
  readonly botId?: string;
  readonly subjectType: "customer" | "operator";
  readonly subjectId: string;
}

export function requireTenantContext(context: TenantContext | undefined): TenantContext {
  if (!context?.tenantId || !context.subjectId) throw new Error("tenant_context_required");
  return Object.freeze({ ...context });
}

export function assertTenantMatch(context: TenantContext, tenantId: string): void {
  if (context.tenantId !== tenantId) throw new Error("cross_tenant_access_denied");
}
